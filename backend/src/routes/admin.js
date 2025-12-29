const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware');
const { flagProfile, getFlaggedProfiles, findDuplicates, computeFraudRisk } = require('../services');

/**
 * GET /api/admin/fraud-flags
 * List all flagged profiles
 */
router.get('/fraud-flags', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
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
router.post('/profiles/:id/flag', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
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
router.get('/duplicates', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
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
router.get('/profiles/:id/fraud-risk', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
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

// =============================================
// USER & ROLE MANAGEMENT (Admin Only)
// =============================================

const { User, Profile, AuditLog } = require('../models');

/**
 * GET /api/admin/users
 * List all users with pagination and filters
 */
router.get('/users', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, search, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (role) query.role = role;
        if (status === 'blocked') query.isActive = false;
        if (status === 'active') query.isActive = true;
        if (status === 'unverified') query.isVerified = false;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        // Get profile counts for each user
        const userIds = users.map(u => u._id);
        const profileCounts = await Profile.aggregate([
            { $match: { createdBy: { $in: userIds }, status: { $ne: 'deleted' } } },
            { $group: { _id: '$createdBy', count: { $sum: 1 } } }
        ]);
        const profileCountMap = {};
        profileCounts.forEach(p => { profileCountMap[p._id.toString()] = p.count; });

        res.json({
            success: true,
            data: {
                users: users.map(u => ({
                    ...u.toObject(),
                    profileCount: profileCountMap[u._id.toString()] || 0
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
 * PATCH /api/admin/users/:id/role
 * Change user role (Admin only)
 */
router.patch('/users/:id/role', authenticate, requireRole('admin'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['admin', 'moderator', 'matchmaker', 'enduser'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        // Cannot change own role
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Audit log
        await AuditLog.create({
            action: 'role_change',
            targetType: 'user',
            targetId: user._id,
            performedBy: req.user._id,
            details: { newRole: role },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/users/:id/block
 * Block a user
 */
router.post('/users/:id/block', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot block yourself' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Moderators cannot block admins
        if (req.user.role === 'moderator' && user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot block an admin' });
        }

        user.isActive = false;
        await user.save();

        // Also deactivate all their profiles
        await Profile.updateMany(
            { createdBy: user._id },
            { status: 'withdrawn' }
        );

        // Audit log
        await AuditLog.create({
            action: 'user_block',
            targetType: 'user',
            targetId: user._id,
            performedBy: req.user._id,
            details: { reason },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'User blocked successfully',
            data: { userId: user._id }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/users/:id/unblock
 * Unblock a user
 */
router.post('/users/:id/unblock', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Audit log
        await AuditLog.create({
            action: 'user_unblock',
            targetType: 'user',
            targetId: user._id,
            performedBy: req.user._id,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'User unblocked successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const [
            totalUsers,
            usersByRole,
            totalProfiles,
            profilesByVisibility,
            blockedUsers,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            Profile.countDocuments({ status: 'active' }),
            Profile.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: '$visibility', count: { $sum: 1 } } }
            ]),
            User.countDocuments({ isActive: false }),
            User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } })
        ]);

        const roleStats = {};
        usersByRole.forEach(r => { roleStats[r._id] = r.count; });

        const visibilityStats = {};
        profilesByVisibility.forEach(v => { visibilityStats[v._id || 'public'] = v.count; });

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    byRole: roleStats,
                    blocked: blockedUsers,
                    newThisWeek: recentUsers
                },
                profiles: {
                    total: totalProfiles,
                    byVisibility: visibilityStats
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

