const express = require('express');
const router = express.Router();
const { Profile, AuditLog } = require('../models');
const {
    authenticate,
    requireVerified,
    validate,
    profileSchema,
    recognitionSchema
} = require('../middleware');
const {
    checkPhoneReuse,
    computeFraudRisk,
    addRecognition,
    getProfileRecognitions,
    calculateRecognitionScore
} = require('../services');

/**
 * GET /api/profiles/public/:customId
 * Public limited view via QR Code/Link
 */
router.get('/public/:customId', async (req, res, next) => {
    try {
        // Only return if active AND not private (stealth mode)
        const profile = await Profile.findOne({
            customId: req.params.customId,
            status: 'active',
            visibility: { $ne: 'private' }
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Return limited data
        const limited = {
            _id: profile._id, // Needed for redirecting to full view
            customId: profile.customId,
            // Security: Mask full name (e.g., "Ramesh K.")
            fullName: profile.fullName ? profile.fullName.split(' ')[0] + (profile.fullName.split(' ').length > 1 ? ' ' + profile.fullName.split(' ')[1][0] + '.' : '') : 'Member',
            profession: profile.profession,
            city: profile.city,
            state: profile.state,
            age: profile.age,
            primaryPhoto: profile.photos?.find(p => p.isPrimary)?.url || profile.photos?.[0]?.url
        };

        // Apply blur transformation if Cloudinary image
        if (limited.primaryPhoto && limited.primaryPhoto.includes('cloudinary') && limited.primaryPhoto.includes('/upload/')) {
            const parts = limited.primaryPhoto.split('/upload/');
            limited.primaryPhoto = `${parts[0]}/upload/e_blur:2000,f_auto/${parts[1]}`;
        }

        res.json({ success: true, data: limited });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profiles
 * List profiles with pagination (excludes private profiles)
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Only show public and restricted profiles (not private)
        const query = {
            status: 'active',
            visibility: { $in: ['public', 'restricted'] }
        };

        // Reviewers/Admins see everything. Others see only approved profiles (or their own).
        if (!['admin', 'moderator', 'reviewer'].includes(req.user.role)) {
            query.$or = [
                { verificationStatus: 'approved' },
                { createdBy: req.user._id }
            ];
        }

        const [profiles, total] = await Promise.all([
            Profile.find(query)
                .select('fullName gender dateOfBirth caste city state education profession photos recognition fraudIndicators.phoneReused visibility')
                .sort({ 'recognition.score': -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Profile.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                profiles: profiles.map(p => ({
                    ...p.toObject(),
                    primaryPhoto: p.photos?.find(ph => ph.isPrimary)?.url || p.photos?.[0]?.url || null
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profiles/pending
 * List pending profiles for review
 */
router.get('/pending', authenticate, async (req, res, next) => {
    try {
        if (!['admin', 'moderator', 'reviewer'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const profiles = await Profile.find({
            verificationStatus: { $in: ['pending', 'changes_requested'] },
            status: 'active'
        })
            .populate('createdBy', 'name email phone')
            .sort({ createdAt: 1 });

        res.json({ success: true, data: profiles });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/profiles/:id/verify
 * Update verification status (Approve/Reject/Duplicate/etc)
 */
router.put('/:id/verify', authenticate, async (req, res, next) => {
    try {
        if (!['admin', 'moderator', 'reviewer'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { status, reason, isDuplicate } = req.body;

        if (status && !['approved', 'rejected', 'changes_requested'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const profile = await Profile.findById(req.params.id);
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        if (status) profile.verificationStatus = status;
        if (reason) profile.rejectionReason = reason;
        if (isDuplicate !== undefined) profile.isDuplicate = isDuplicate;

        await profile.save();

        // Audit log
        await AuditLog.create({
            action: 'profile_verify',
            targetType: 'profile',
            targetId: profile._id,
            performedBy: req.user._id,
            changes: { status, reason, isDuplicate },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profiles/:id
 * Get single profile with full details
 */
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.params.id)
            .populate('createdBy', 'name');

        if (!profile || profile.status === 'deleted') {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const isOwner = profile.createdBy._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

        // Access Logic
        let hasAccess = true;
        let sensitiveDataHidden = false;

        if (profile.visibility === 'restricted' && !isOwner && !isAdmin) {
            // Check whitelist
            const isWhitelisted = profile.accessWhitelist && profile.accessWhitelist.includes(req.user._id);
            if (!isWhitelisted) {
                hasAccess = false;
                sensitiveDataHidden = true;
            }
        }

        if (profile.visibility === 'private' && !isOwner && !isAdmin) {
            return res.status(403).json({ error: 'This profile is private', errorHi: 'यह प्रोफ़ाइल निजी है' });
        }

        // Update lastSeenAt
        profile.lastSeenAt = new Date();

        // Increment View Count & Track Visitor (if not owner)
        if (!isOwner) {
            // Add/Update visitor
            if (!profile.visitors) {
                profile.visitors = [];
            }

            const visitorIndex = profile.visitors.findIndex(v => v.user.toString() === req.user._id.toString());

            if (visitorIndex > -1) {
                // Existing visitor: Just update timestamp, DO NOT increment viewCount
                profile.visitors[visitorIndex].visitedAt = new Date();
            } else {
                // New visitor: Add to list AND increment viewCount
                profile.visitors.push({ user: req.user._id, visitedAt: new Date() });
                profile.viewCount = (profile.viewCount || 0) + 1;
            }

            // Limit to last 50 visitors
            if (profile.visitors.length > 50) {
                profile.visitors.sort((a, b) => b.visitedAt - a.visitedAt);
                profile.visitors.splice(50);
            }
        }

        await profile.save();

        // Populate visitors if owner
        if (isOwner) {
            await profile.populate('visitors.user', 'name');
        }

        // Get fraud risk
        const fraudRisk = await computeFraudRisk(profile._id);

        let finalProfile = profile.toObject();

        // Hide Sensitive Data if Restricted
        if (sensitiveDataHidden) {
            // Mask contact details
            finalProfile.phone = null;
            finalProfile.email = null;
            finalProfile.alternatePhone = null;

            // Mask Horoscope (except basic sign)
            if (finalProfile.horoscope) {
                finalProfile.horoscope = {
                    rashi: finalProfile.horoscope.rashi,
                    nakshatra: finalProfile.horoscope.nakshatra
                    // Hide birthTime, place, etc.
                };
            }

            // Flag for UI
            finalProfile.hasAccess = false;
        } else {
            finalProfile.hasAccess = true;
        }

        res.json({
            success: true,
            data: {
                profile: {
                    ...finalProfile,
                    visitors: isOwner ? profile.visitors : undefined, // Only send visitors to owner
                    fraudRisk
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/profiles
 * Create a new profile
 * 
 * Role limits:
 * - admin/moderator: Cannot create profiles
 * - matchmaker/enduser: Can create profiles (enduser for family members)
 */
router.post('/', authenticate, validate(profileSchema), async (req, res, next) => {
    try {
        const { role } = req.user;

        // Admin and moderator cannot create profiles
        if (['admin', 'moderator'].includes(role)) {
            return res.status(403).json({
                error: 'Administrators and moderators cannot create matrimonial profiles',
                errorHi: 'प्रशासक और मॉडरेटर विवाह प्रोफ़ाइल नहीं बना सकते'
            });
        }

        // All other roles (matchmaker, enduser) can create profiles
        // EndUsers create for family: self, son, daughter, brother, sister, etc.

        const profileData = req.validatedBody;

        // Check phone reuse
        const phoneCheck = await checkPhoneReuse(null, profileData.phone);

        const profile = await Profile.create({
            ...profileData,
            createdBy: req.user._id,
            fraudIndicators: {
                phoneReused: phoneCheck.isReused
            }
        });

        // Audit log
        await AuditLog.create({
            action: 'profile_create',
            targetType: 'profile',
            targetId: profile._id,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/profiles/:id
 * Update a profile
 */
router.put('/:id', authenticate, validate(profileSchema), async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile || profile.status === 'deleted') {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Only creator or admin can update
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }

        const updateData = req.validatedBody;

        // Check phone reuse if phone changed
        if (updateData.phone !== profile.phone) {
            const phoneCheck = await checkPhoneReuse(profile._id, updateData.phone);
            updateData['fraudIndicators.phoneReused'] = phoneCheck.isReused;
        }

        const oldData = profile.toObject();

        Object.assign(profile, updateData);
        profile.updatedBy = req.user._id;
        await profile.save();

        // Audit log
        await AuditLog.create({
            action: 'profile_update',
            targetType: 'profile',
            targetId: profile._id,
            performedBy: req.user._id,
            changes: { before: oldData, after: profile.toObject() },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/profiles/:id
 * Soft delete a profile
 */
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Only creator or admin can delete
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this profile' });
        }

        profile.status = 'deleted';
        profile.deletedAt = new Date();
        profile.deletedBy = req.user._id;
        await profile.save();

        // Audit log
        await AuditLog.create({
            action: 'profile_delete',
            targetType: 'profile',
            targetId: profile._id,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/profiles/:id/refer
 * Increment times referred counter
 */
router.post('/:id/refer', authenticate, async (req, res, next) => {
    try {
        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            { $inc: { timesReferred: 1 } },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            success: true,
            data: { timesReferred: profile.timesReferred }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/profiles/:id/status
 * Change profile status (matched, withdrawn)
 */
router.put('/:id/status', authenticate, async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['active', 'matched', 'withdrawn'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Only creator or admin can change status
        const isCreator = profile.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        profile.status = status;
        await profile.save();

        // Audit log
        await AuditLog.create({
            action: 'profile_status_change',
            targetType: 'profile',
            targetId: profile._id,
            performedBy: req.user._id,
            changes: { status },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/profiles/:id/recognitions
 * Get all recognitions for a profile
 */
router.get('/:id/recognitions', authenticate, async (req, res, next) => {
    try {
        const recognitions = await getProfileRecognitions(req.params.id);
        const summary = await calculateRecognitionScore(req.params.id);

        res.json({
            success: true,
            data: {
                recognitions,
                summary
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/profiles/:id/recognitions
 * Add recognition (verified users only)
 */
router.post('/:id/recognitions', authenticate, requireVerified, validate(recognitionSchema), async (req, res, next) => {
    try {
        const { type, relationship, notes } = req.validatedBody;

        const result = await addRecognition(
            req.params.id,
            req.user._id,
            type,
            relationship,
            notes,
            req.ip,
            req.get('User-Agent')
        );

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.message.includes('already provided') || error.message.includes('Only verified')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

module.exports = router;
