const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Profile, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware');
const { parseWhatsAppExport, validateBiodata } = require('../utils/whatsappParser');
const { checkPhoneReuse } = require('../services');

// Multer config for text file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only .txt files are allowed'));
        }
    }
});

/**
 * POST /api/import/whatsapp
 * Import profiles from WhatsApp chat export
 * Admin/Elder only
 */
router.post('/whatsapp', authenticate, requireRole('admin', 'elder'), upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please upload a .txt file exported from WhatsApp.' });
        }

        // Parse the file content
        const content = req.file.buffer.toString('utf-8');
        const extractedBiodata = parseWhatsAppExport(content);

        if (extractedBiodata.length === 0) {
            return res.status(400).json({
                error: 'No biodata entries found in the file.',
                hint: 'Make sure the file contains matrimonial biodata messages with fields like Name, Age, Caste, Education, etc.'
            });
        }

        // Preview mode - don't save, just show what was extracted
        if (req.query.preview === 'true') {
            return res.json({
                success: true,
                data: {
                    count: extractedBiodata.length,
                    preview: extractedBiodata.slice(0, 10).map(b => ({
                        fullName: b.fullName,
                        gender: b.gender,
                        phone: b.phone,
                        caste: b.caste,
                        city: b.city,
                        education: b.education,
                        _rawText: b._rawText?.substring(0, 200)
                    }))
                }
            });
        }

        // Import mode - save to database
        const results = {
            imported: 0,
            skipped: 0,
            errors: []
        };

        for (const biodata of extractedBiodata) {
            try {
                const validated = validateBiodata(biodata, req.user._id);

                // Check for phone duplicates
                if (validated.phone && !validated.phone.startsWith('IMPORT-')) {
                    const phoneCheck = await checkPhoneReuse(null, validated.phone);
                    if (phoneCheck.isReused) {
                        results.skipped++;
                        results.errors.push({
                            name: validated.fullName,
                            reason: 'Phone number already exists'
                        });
                        continue;
                    }
                }

                // Create profile
                const profile = await Profile.create(validated);
                results.imported++;

                // Audit log
                await AuditLog.create({
                    action: 'profile_create',
                    targetType: 'profile',
                    targetId: profile._id,
                    performedBy: req.user._id,
                    changes: { source: 'whatsapp_import' },
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });

            } catch (error) {
                results.skipped++;
                results.errors.push({
                    name: biodata.fullName || 'Unknown',
                    reason: error.message
                });
            }
        }

        res.json({
            success: true,
            data: {
                total: extractedBiodata.length,
                imported: results.imported,
                skipped: results.skipped,
                errors: results.errors.slice(0, 10) // Only show first 10 errors
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/import/json
 * Import profiles from JSON file (for manual data preparation)
 * Admin only
 */
router.post('/json', authenticate, requireRole('admin'), upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let profiles;
        try {
            profiles = JSON.parse(req.file.buffer.toString('utf-8'));
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON file' });
        }

        if (!Array.isArray(profiles)) {
            profiles = [profiles];
        }

        const results = { imported: 0, skipped: 0, errors: [] };

        for (const data of profiles) {
            try {
                const validated = validateBiodata(data, req.user._id);
                await Profile.create(validated);
                results.imported++;
            } catch (error) {
                results.skipped++;
                results.errors.push({
                    name: data.fullName || 'Unknown',
                    reason: error.message
                });
            }
        }

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
