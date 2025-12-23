const express = require('express');
const router = express.Router();
const { authenticate, validateQuery, searchSchema } = require('../middleware');
const { searchProfiles, findMatches } = require('../services');

/**
 * GET /api/search/profiles
 * Advanced profile search with filters
 */
router.get('/profiles', authenticate, validateQuery(searchSchema), async (req, res, next) => {
    try {
        const { page, limit, sortBy, ...filters } = req.validatedQuery;

        const result = await searchProfiles(filters, { page, limit });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/search/match/:id
 * Get matching profiles based on preferences
 */
router.get('/match/:id', authenticate, async (req, res, next) => {
    try {
        const matches = await findMatches(req.params.id);

        res.json({
            success: true,
            data: { matches }
        });
    } catch (error) {
        if (error.message === 'Profile not found') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
});

module.exports = router;
