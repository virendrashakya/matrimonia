const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Profile, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware');
const { parseWhatsAppExport, validateBiodata } = require('../utils/whatsappParser');
const { checkPhoneReuse } = require('../services');

// Multer config for text file uploads
const AdmZip = require('adm-zip');
const pdf = require('pdf-parse');
const { parseBiodataWithAI } = require('../utils/aiParser');

// Multer config for ZIP and Text uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for ZIP acts
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'text/plain' ||
            file.originalname.endsWith('.txt') ||
            file.mimetype === 'application/zip' ||
            file.mimetype === 'application/x-zip-compressed' ||
            file.originalname.endsWith('.zip')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only .txt or .zip files are allowed'));
        }
    }
});

/**
 * POST /api/import/whatsapp
 * Import profiles from WhatsApp chat export (TXT or ZIP with media)
 * Admin/Elder only
 */
router.post('/whatsapp', authenticate, requireRole('admin', 'elder'), upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        let extractedBiodata = [];
        let chatContent = '';
        let zipEntries = [];
        let zip = null;

        // processing logic
        if (req.file.originalname.endsWith('.zip')) {
            // Handle ZIP
            try {
                zip = new AdmZip(req.file.buffer);
                zipEntries = zip.getEntries();

                // Find _chat.txt
                const chatEntry = zipEntries.find(e => e.entryName.endsWith('_chat.txt') && !e.entryName.includes('MACOSX'));
                if (!chatEntry) {
                    throw new Error('_chat.txt not found in ZIP archive');
                }
                chatContent = chatEntry.getData().toString('utf8');
            } catch (e) {
                return res.status(400).json({ error: 'Invalid ZIP file: ' + e.message });
            }
        } else {
            // Handle TXT
            chatContent = req.file.buffer.toString('utf-8');
        }

        // 1. Parse standard text messages first
        const textBasedBiodata = parseWhatsAppExport(chatContent);
        extractedBiodata = [...textBasedBiodata];

        // 2. Scan for Attachments if ZIP provided
        if (zip) {
            const lines = chatContent.split('\n');
            const attachmentRegex = /<attached: (.+\.pdf)>/;

            for (const line of lines) {
                const match = line.match(attachmentRegex);
                if (match) {
                    const filename = match[1].trim();
                    // Try to find the file in zip (loose match for folders)
                    const pdfEntry = zipEntries.find(e => e.entryName.endsWith(filename) && !e.entryName.includes('MACOSX'));

                    if (pdfEntry) {
                        try {
                            const pdfBuffer = pdfEntry.getData();
                            const pdfData = await pdf(pdfBuffer);
                            const rawPdfText = pdfData.text;

                            // Use AI to parse the PDF text
                            if (rawPdfText && rawPdfText.length > 50) {
                                // Only try AI if we have enough text
                                try {
                                    // Check if AI is configured
                                    if (process.env.GEMINI_API_KEY) {
                                        const aiParsed = await parseBiodataWithAI(rawPdfText);
                                        if (aiParsed && (aiParsed.fullName || aiParsed.phone)) {
                                            aiParsed.source = 'pdf_ai';
                                            aiParsed._rawText = rawPdfText.substring(0, 500) + '...';
                                            extractedBiodata.push(aiParsed);
                                        }
                                    }
                                } catch (aiError) {
                                    console.warn(`Failed to parse PDF ${filename} with AI:`, aiError.message);
                                }
                            }
                        } catch (pdfError) {
                            console.warn(`Failed to read PDF ${filename}:`, pdfError.message);
                        }
                    }
                }
            }
        }

        if (extractedBiodata.length === 0) {
            return res.status(400).json({
                error: 'No biodata entries found in the file.',
                hint: 'Ensure file contains biodata text or PDFs.'
            });
        }

        // Preview mode
        if (req.query.preview === 'true') {
            return res.json({
                success: true,
                data: {
                    count: extractedBiodata.length,
                    preview: extractedBiodata.slice(0, 10).map(b => ({
                        fullName: b.fullName || 'Unknown',
                        gender: b.gender,
                        phone: b.phone,
                        caste: b.caste,
                        education: b.education,
                        source: b.source || 'text',
                        _rawText: b._rawText?.substring(0, 100)
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
                    changes: { source: biodata.source || 'whatsapp_import' },
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
                errors: results.errors.slice(0, 10)
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
