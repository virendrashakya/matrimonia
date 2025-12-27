/**
 * User Routes - Personal user profile endpoints (separate from matrimonial profiles)
 */

const express = require('express');
const router = express.Router();
const { User, Profile, RecognitionEntry } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/user/me
 * Get current user's profile with stats
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('verifiedBy', 'name role');

        // Get stats
        const [profilesCount, recognitionsGiven] = await Promise.all([
            Profile.countDocuments({ createdBy: req.user._id, status: { $ne: 'deleted' } }),
            RecognitionEntry.countDocuments({ givenBy: req.user._id })
        ]);

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                verifiedBy: user.verifiedBy,
                verifiedAt: user.verifiedAt,
                agency: user.agency,
                preferredLanguage: user.preferredLanguage,
                isActive: user.isActive,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            stats: {
                profilesCreated: profilesCount,
                recognitionsGiven: recognitionsGiven
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

/**
 * PUT /api/user/me
 * Update current user's profile
 */
router.put('/me', authenticate, async (req, res) => {
    try {
        const allowedUpdates = ['name', 'email', 'preferredLanguage', 'agency'];
        const updates = {};

        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({ user, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * PUT /api/user/change-password
 * Change user's password
 */
router.put('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+passwordHash');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update password (pre-save hook will hash)
        user.passwordHash = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

/**
 * GET /api/user/my-profiles
 * Get matrimonial profiles created by the current user
 */
router.get('/my-profiles', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { createdBy: req.user._id };
        if (status && status !== 'all') {
            query.status = status;
        } else {
            query.status = { $ne: 'deleted' };
        }

        const [profiles, total] = await Promise.all([
            Profile.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('fullName gender dateOfBirth city state photos status recognition createdAt'),
            Profile.countDocuments(query)
        ]);

        res.json({
            profiles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get my profiles error:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

/**
 * GET /api/user/recommendations
 * Get profile recommendations for the current user
 * Basic algorithm: recent profiles with good recognition scores, excluding user's own
 */
router.get('/recommendations', authenticate, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get profiles that are:
        // 1. Not created by this user
        // 2. Active status
        // 3. Have good recognition score
        // 4. Recent (last 30 days prioritized)
        const profiles = await Profile.find({
            createdBy: { $ne: req.user._id },
            status: 'active'
        })
            .sort({ 'recognition.score': -1, createdAt: -1 })
            .limit(parseInt(limit))
            .select('fullName gender dateOfBirth city state caste photos recognition createdAt')
            .populate('createdBy', 'name role');

        res.json({ recommendations: profiles });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

/**
 * GET /api/user/dashboard-stats
 * Get role-specific dashboard statistics
 */
router.get('/dashboard-stats', authenticate, async (req, res) => {
    try {
        const { role } = req.user;
        const stats = {};

        // Common stats for all users
        stats.myProfiles = await Profile.countDocuments({
            createdBy: req.user._id,
            status: { $ne: 'deleted' }
        });
        stats.myRecognitions = await RecognitionEntry.countDocuments({
            givenBy: req.user._id
        });

        // Role-specific stats
        if (role === 'admin') {
            const [totalUsers, pendingVerifications, totalProfiles, activeProfiles] = await Promise.all([
                User.countDocuments({ isActive: true }),
                User.countDocuments({ isVerified: false, isActive: true }),
                Profile.countDocuments(),
                Profile.countDocuments({ status: 'active' })
            ]);
            stats.totalUsers = totalUsers;
            stats.pendingVerifications = pendingVerifications;
            stats.totalProfiles = totalProfiles;
            stats.activeProfiles = activeProfiles;
        }

        if (role === 'moderator') {
            const [flaggedProfiles, pendingReviews] = await Promise.all([
                Profile.countDocuments({ 'fraudIndicators.isFlagged': true, status: 'active' }),
                Profile.countDocuments({ status: 'pending_review' })
            ]);
            stats.flaggedProfiles = flaggedProfiles;
            stats.pendingReviews = pendingReviews;
        }

        if (role === 'matchmaker') {
            const [totalClients, matchedProfiles] = await Promise.all([
                Profile.countDocuments({ createdBy: req.user._id, status: { $ne: 'deleted' } }),
                Profile.countDocuments({ createdBy: req.user._id, status: 'matched' })
            ]);
            stats.totalClients = totalClients;
            stats.matchedProfiles = matchedProfiles;
        }

        res.json({ stats });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;
