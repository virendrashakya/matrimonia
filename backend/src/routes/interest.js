/**
 * Interest Routes - Express and manage matrimonial interests
 */

const express = require('express');
const router = express.Router();
const { Interest, Profile, Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/interests/:profileId
 * Express interest in a profile
 */
router.post('/:profileId', authenticate, async (req, res) => {
    try {
        const { profileId } = req.params;
        const { fromProfileId, message } = req.body;

        // Admin and moderator cannot express interest
        if (['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({
                error: 'Administrators and moderators cannot express interest in profiles',
                errorHi: 'प्रशासक और मॉडरेटर प्रोफ़ाइल में रुचि नहीं दिखा सकते'
            });
        }

        // Validate target profile exists
        const toProfile = await Profile.findById(profileId);
        if (!toProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Get the from profile (user must own or have created it)
        let fromProfile;
        if (fromProfileId) {
            fromProfile = await Profile.findOne({
                _id: fromProfileId,
                createdBy: req.user._id,
                status: { $ne: 'deleted' }
            });
        } else {
            // Get user's first profile
            fromProfile = await Profile.findOne({
                createdBy: req.user._id,
                status: 'active'
            });
        }

        if (!fromProfile) {
            return res.status(400).json({
                error: 'You need an active profile to express interest'
            });
        }

        // Can't express interest in own profile
        if (fromProfile._id.toString() === profileId) {
            return res.status(400).json({ error: 'Cannot express interest in your own profile' });
        }

        // Check if interest already exists
        const existingInterest = await Interest.findOne({
            fromProfile: fromProfile._id,
            toProfile: profileId
        });

        if (existingInterest) {
            return res.status(400).json({
                error: 'Interest already expressed',
                status: existingInterest.status
            });
        }

        // Create interest
        const interest = await Interest.create({
            fromProfile: fromProfile._id,
            toProfile: profileId,
            expressedBy: req.user._id,
            message,
            status: 'pending'
        });

        // Create notification for profile owner
        const toProfileDoc = await Profile.findById(profileId).populate('createdBy');
        if (toProfileDoc?.createdBy?._id) {
            await Notification.createInterestNotification(
                toProfileDoc.createdBy._id,
                'interest_received',
                fromProfile.fullName,
                fromProfile._id,
                interest._id
            );
        }

        res.status(201).json({
            success: true,
            interest,
            message: 'Interest expressed successfully'
        });
    } catch (error) {
        console.error('Express interest error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Interest already expressed' });
        }
        res.status(500).json({ error: 'Failed to express interest' });
    }
});

/**
 * GET /api/interests/sent
 * Get interests sent by user's profiles
 */
router.get('/sent', authenticate, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get user's profiles
        const userProfiles = await Profile.find({
            createdBy: req.user._id
        }).select('_id');
        const profileIds = userProfiles.map(p => p._id);

        const query = { fromProfile: { $in: profileIds } };
        if (status) query.status = status;

        const [interests, total] = await Promise.all([
            Interest.find(query)
                .populate('fromProfile', 'fullName photos city')
                .populate('toProfile', 'fullName photos city gender')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Interest.countDocuments(query)
        ]);

        res.json({
            interests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get sent interests error:', error);
        res.status(500).json({ error: 'Failed to fetch interests' });
    }
});

/**
 * GET /api/interests/received
 * Get interests received on user's profiles
 */
router.get('/received', authenticate, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get user's profiles
        const userProfiles = await Profile.find({
            createdBy: req.user._id
        }).select('_id');
        const profileIds = userProfiles.map(p => p._id);

        const query = { toProfile: { $in: profileIds } };
        if (status) query.status = status;

        const [interests, total] = await Promise.all([
            Interest.find(query)
                .populate('fromProfile', 'fullName photos city gender age caste')
                .populate('toProfile', 'fullName')
                .populate('expressedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Interest.countDocuments(query)
        ]);

        res.json({
            interests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get received interests error:', error);
        res.status(500).json({ error: 'Failed to fetch interests' });
    }
});

/**
 * PUT /api/interests/:id/respond
 * Accept or reject an interest
 */
router.put('/:id/respond', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, message } = req.body;

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const interest = await Interest.findById(id)
            .populate('toProfile')
            .populate('fromProfile');

        if (!interest) {
            return res.status(404).json({ error: 'Interest not found' });
        }

        // Verify user owns the target profile
        const ownsProfile = await Profile.exists({
            _id: interest.toProfile._id,
            createdBy: req.user._id
        });

        if (!ownsProfile) {
            return res.status(403).json({ error: 'Not authorized to respond to this interest' });
        }

        if (interest.status !== 'pending') {
            return res.status(400).json({ error: 'Interest already responded to' });
        }

        // Update interest
        interest.status = action === 'accept' ? 'accepted' : 'rejected';
        interest.respondedAt = new Date();
        interest.respondedBy = req.user._id;
        interest.responseMessage = message;
        await interest.save();

        // Notify the person who expressed interest
        const fromProfileDoc = await Profile.findById(interest.fromProfile._id)
            .populate('createdBy');

        if (fromProfileDoc?.createdBy?._id) {
            await Notification.createInterestNotification(
                fromProfileDoc.createdBy._id,
                action === 'accept' ? 'interest_accepted' : 'interest_rejected',
                interest.toProfile.fullName,
                interest.toProfile._id,
                interest._id
            );

            // Check if it's a match (both accepted)
            if (action === 'accept') {
                const isMatch = await Interest.checkMatch(
                    interest.toProfile._id,
                    interest.fromProfile._id
                );
                if (isMatch) {
                    // Notify both parties about the match
                    await Notification.createInterestNotification(
                        fromProfileDoc.createdBy._id,
                        'match_found',
                        interest.toProfile.fullName,
                        interest.toProfile._id,
                        interest._id
                    );
                    await Notification.createInterestNotification(
                        req.user._id,
                        'match_found',
                        interest.fromProfile.fullName,
                        interest.fromProfile._id,
                        interest._id
                    );
                }
            }
        }

        res.json({
            success: true,
            interest,
            message: `Interest ${action === 'accept' ? 'accepted' : 'rejected'} successfully`
        });
    } catch (error) {
        console.error('Respond to interest error:', error);
        res.status(500).json({ error: 'Failed to respond to interest' });
    }
});

/**
 * GET /api/interests/matches
 * Get all matches (mutual interests)
 */
router.get('/matches', authenticate, async (req, res) => {
    try {
        // Get user's profiles
        const userProfiles = await Profile.find({
            createdBy: req.user._id
        }).select('_id');
        const profileIds = userProfiles.map(p => p._id);

        const matches = [];

        for (const profileId of profileIds) {
            // Get profiles that have mutually accepted interests
            const sentAccepted = await Interest.find({
                fromProfile: profileId,
                status: 'accepted'
            }).populate('toProfile', 'fullName photos city gender age caste phone createdBy')
                .populate({
                    path: 'toProfile',
                    populate: { path: 'createdBy', select: 'name phone' }
                });

            for (const interest of sentAccepted) {
                const reverseInterest = await Interest.findOne({
                    fromProfile: interest.toProfile._id,
                    toProfile: profileId,
                    status: 'accepted'
                });

                if (reverseInterest) {
                    matches.push({
                        profile: interest.toProfile,
                        matchedAt: new Date(Math.max(
                            interest.respondedAt || interest.createdAt,
                            reverseInterest.respondedAt || reverseInterest.createdAt
                        ))
                    });
                }
            }
        }

        // Sort by match date, most recent first
        matches.sort((a, b) => b.matchedAt - a.matchedAt);

        res.json({ matches });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

/**
 * DELETE /api/interests/:id
 * Withdraw an interest
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const interest = await Interest.findById(id);
        if (!interest) {
            return res.status(404).json({ error: 'Interest not found' });
        }

        // Verify user expressed this interest
        if (interest.expressedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (interest.status !== 'pending') {
            return res.status(400).json({ error: 'Can only withdraw pending interests' });
        }

        interest.status = 'withdrawn';
        await interest.save();

        res.json({ success: true, message: 'Interest withdrawn' });
    } catch (error) {
        console.error('Withdraw interest error:', error);
        res.status(500).json({ error: 'Failed to withdraw interest' });
    }
});

module.exports = router;
