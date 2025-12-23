const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware');
const { flagProfile, getFlaggedProfiles, findDuplicates, computeFraudRisk } = require('../services');

/**
 * GET /api/admin/fraud-flags
 * List all flagged profiles
 */
router.get('/fraud-flags', authenticate, requireRole('admin', 'elder'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const result = await getFlaggedProfiles(parseInt(page), parseInt(limit));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/profiles/:id/flag
 * Flag a profile for fraud/concerns
 */
router.post('/profiles/:id/flag', authenticate, requireRole('admin', 'elder'), async (req, res, next) => {
    try {
        const { flagType, reason } = req.body;

        if (!flagType || !reason) {
            return res.status(400).json({ error: 'flagType and reason are required' });
        }

        const profile = await flagProfile(
            req.params.id,
            flagType,
            reason,
            req.user._id,
            req.ip,
            req.get('User-Agent')
        );

        res.json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        if (error.message === 'Profile not found') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
});

/**
 * GET /api/admin/duplicates
 * Find potential duplicate profiles
 */
router.get('/duplicates', authenticate, requireRole('admin', 'elder'), async (req, res, next) => {
    try {
        const duplicates = await findDuplicates();

        res.json({
            success: true,
            data: { duplicates }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/profiles/:id/fraud-risk
 * Get fraud risk assessment for a profile
 */
router.get('/profiles/:id/fraud-risk', authenticate, requireRole('admin', 'elder'), async (req, res, next) => {
    try {
        const fraudRisk = await computeFraudRisk(req.params.id);

        if (!fraudRisk) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            success: true,
            data: { fraudRisk }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
