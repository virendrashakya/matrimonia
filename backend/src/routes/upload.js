const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Profile, AuditLog } = require('../models');
const { authenticate } = require('../middleware');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isImage = file.mimetype.startsWith('image/');
        return {
            folder: isImage ? 'matrimonia/photos' : 'matrimonia/biodatas',
            allowed_formats: isImage ? ['jpg', 'jpeg', 'png', 'webp'] : ['pdf'],
            resource_type: isImage ? 'image' : 'raw',
            transformation: isImage ? [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }] : undefined
        };
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP images and PDF are allowed.'));
        }
    }
});

/**
 * POST /api/upload/photo
 * Upload a profile photo
 */
router.post('/photo', authenticate, upload.single('photo'), async (req, res, next) => {
    try {
        const { profileId, isPrimary } = req.body;

        if (!profileId) {
            return res.status(400).json({ error: 'profileId is required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const profile = await Profile.findById(profileId);
        if (!profile) {
            // Clean up uploaded file
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check authorization
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isCreator && !isAdmin) {
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(403).json({ error: 'Not authorized' });
        }

        // If setting as primary, unset other primaries
        if (isPrimary === 'true' && profile.photos.length > 0) {
            profile.photos.forEach(p => p.isPrimary = false);
        }

        // Add photo to profile
        profile.photos.push({
            url: req.file.path,
            publicId: req.file.filename,
            isPrimary: isPrimary === 'true' || profile.photos.length === 0
        });

        await profile.save();

        // Audit log
        await AuditLog.create({
            action: 'upload_photo',
            targetType: 'profile',
            targetId: profileId,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: {
                photo: profile.photos[profile.photos.length - 1]
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/upload/biodata
 * Upload a biodata PDF
 */
router.post('/biodata', authenticate, upload.single('biodata'), async (req, res, next) => {
    try {
        const { profileId } = req.body;

        if (!profileId) {
            return res.status(400).json({ error: 'profileId is required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const profile = await Profile.findById(profileId);
        if (!profile) {
            await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check authorization
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isCreator && !isAdmin) {
            await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete old biodata if exists
        if (profile.biodataFile?.publicId) {
            await cloudinary.uploader.destroy(profile.biodataFile.publicId, { resource_type: 'raw' });
        }

        profile.biodataFile = {
            url: req.file.path,
            publicId: req.file.filename,
            uploadedAt: new Date()
        };

        await profile.save();

        // Audit log
        await AuditLog.create({
            action: 'upload_biodata',
            targetType: 'profile',
            targetId: profileId,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: {
                biodataFile: profile.biodataFile
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/upload/photo/:profileId/:photoId
 * Delete a profile photo
 */
router.delete('/photo/:profileId/:photoId', authenticate, async (req, res, next) => {
    try {
        const { profileId, photoId } = req.params;

        const profile = await Profile.findById(profileId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check authorization
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const photo = profile.photos.id(photoId);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        // Delete from Cloudinary
        if (photo.publicId) {
            await cloudinary.uploader.destroy(photo.publicId);
        }

        // Remove from profile
        profile.photos.pull(photoId);

        // If deleted photo was primary and there are other photos, make first one primary
        if (photo.isPrimary && profile.photos.length > 0) {
            profile.photos[0].isPrimary = true;
        }

        await profile.save();

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/upload/profiles/:profileId/photos
 * Upload photo to specific profile (simplified route)
 */
router.post('/profiles/:profileId/photos', authenticate, upload.single('photo'), async (req, res, next) => {
    try {
        const { profileId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const profile = await Profile.findById(profileId);
        if (!profile) {
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check authorization
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = ['admin', 'moderator'].includes(req.user.role);
        if (!isCreator && !isAdmin) {
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Limit to 5 photos
        if (profile.photos.length >= 5) {
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(400).json({ error: 'Maximum 5 photos allowed' });
        }

        // Add photo (first photo is automatically primary)
        profile.photos.push({
            url: req.file.path,
            publicId: req.file.filename,
            isPrimary: profile.photos.length === 0
        });

        await profile.save();

        res.json({
            success: true,
            data: { photo: profile.photos[profile.photos.length - 1] }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/upload/profiles/:profileId/photos
 * Delete photo from profile (using URL in body)
 */
router.delete('/profiles/:profileId/photos', authenticate, async (req, res, next) => {
    try {
        const { profileId } = req.params;
        const { photoUrl } = req.body;

        const profile = await Profile.findById(profileId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check authorization
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = ['admin', 'moderator'].includes(req.user.role);
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const photoIndex = profile.photos.findIndex(p => p.url === photoUrl);
        if (photoIndex === -1) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const photo = profile.photos[photoIndex];

        // Delete from Cloudinary
        if (photo.publicId) {
            await cloudinary.uploader.destroy(photo.publicId);
        }

        // Remove from profile
        profile.photos.splice(photoIndex, 1);

        // If deleted photo was primary, make first remaining photo primary
        if (photo.isPrimary && profile.photos.length > 0) {
            profile.photos[0].isPrimary = true;
        }

        await profile.save();

        res.json({ success: true, message: 'Photo deleted' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/upload/profiles/:profileId/photos/primary
 * Set primary photo for profile
 */
router.patch('/profiles/:profileId/photos/primary', authenticate, async (req, res, next) => {
    try {
        const { profileId } = req.params;
        const { photoUrl } = req.body;

        const profile = await Profile.findById(profileId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check authorization
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = ['admin', 'moderator'].includes(req.user.role);
        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const photo = profile.photos.find(p => p.url === photoUrl);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        // Unset all primaries, then set the target
        profile.photos.forEach(p => p.isPrimary = false);
        photo.isPrimary = true;

        await profile.save();

        res.json({ success: true, message: 'Primary photo set' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
