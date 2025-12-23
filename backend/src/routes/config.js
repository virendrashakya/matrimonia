const express = require('express');
const router = express.Router();
const Configuration = require('../models/Configuration');
const { authenticate } = require('../middleware');

/**
 * GET /api/config
 * Get app configuration (public - no auth required for initial load)
 */
router.get('/', async (req, res, next) => {
    try {
        const config = await Configuration.getConfig();
        res.json({
            success: true,
            data: { config }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/config
 * Update configuration (admin only)
 */
router.put('/', authenticate, async (req, res, next) => {
    try {
        // Only admin can update config
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can update configuration' });
        }

        const updates = req.body;

        // Remove fields that shouldn't be updated
        delete updates._id;

        updates.updatedBy = req.user._id;
        updates.updatedAt = new Date();

        const config = await Configuration.findByIdAndUpdate(
            'app_config',
            { $set: updates },
            { new: true, upsert: true }
        );

        console.log(`✅ Configuration updated by ${req.user.name}`);

        res.json({
            success: true,
            data: { config }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/config/add-option
 * Add a new option to a specific list (admin only)
 */
router.post('/add-option', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can add options' });
        }

        const { field, option } = req.body;

        // Validate field exists
        const validFields = [
            'rashiOptions', 'nakshatraOptions', 'stateOptions', 'religionOptions',
            'languageOptions', 'educationOptions', 'professionOptions', 'casteOptions',
            'complexionOptions', 'bodyTypeOptions', 'dietOptions', 'maritalStatusOptions',
            'familyTypeOptions', 'manglikOptions', 'incomeOptions'
        ];

        if (!validFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid field name' });
        }

        const config = await Configuration.findByIdAndUpdate(
            'app_config',
            {
                $push: { [field]: option },
                $set: { updatedBy: req.user._id, updatedAt: new Date() }
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            data: { config }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/config/remove-option
 * Remove an option from a specific list (admin only)
 */
router.delete('/remove-option', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can remove options' });
        }

        const { field, value } = req.body;

        let pullQuery;
        if (field === 'casteOptions' || field === 'incomeOptions') {
            pullQuery = { [field]: value };
        } else {
            pullQuery = { [field]: { value: value } };
        }

        const config = await Configuration.findByIdAndUpdate(
            'app_config',
            {
                $pull: pullQuery,
                $set: { updatedBy: req.user._id, updatedAt: new Date() }
            },
            { new: true }
        );

        res.json({
            success: true,
            data: { config }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
