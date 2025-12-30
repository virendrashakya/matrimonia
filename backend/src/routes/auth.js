const express = require('express');
const router = express.Router();
const { User, AuditLog } = require('../models');
const {
    authenticate,
    requireRole,
    generateToken,
    validate,
    registerSchema,
    loginSchema
} = require('../middleware');
const passport = require('passport');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { name, phone, email, password } = req.validatedBody;

        // Check if phone already exists
        const existing = await User.findOne({ phone });
        if (existing) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        // Create user (password will be hashed by pre-save hook)
        const user = await User.create({
            name,
            phone,
            email,
            passwordHash: password
        });

        // Audit log
        await AuditLog.create({
            action: 'user_register',
            targetType: 'user',
            targetId: user._id,
            performedBy: user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Login with phone and password
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { phone, password } = req.validatedBody;

        const user = await User.findOne({ phone }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ error: 'Invalid phone or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone or password' });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Audit log
        await AuditLog.create({
            action: 'user_login',
            targetType: 'user',
            targetId: user._id,
            performedBy: user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
    res.json({
        success: true,
        data: { user: req.user }
    });
});

/**
 * PATCH /api/auth/me/language
 * Update user's preferred language
 */
router.patch('/me/language', authenticate, async (req, res, next) => {
    try {
        const { language } = req.body;

        if (!['en', 'hi'].includes(language)) {
            return res.status(400).json({ error: 'Invalid language. Supported: en, hi' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { preferredLanguage: language },
            { new: true }
        );

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/auth/verify-user/:userId
 * Verify a user (admin/elder only)
 */
router.put('/verify-user/:userId', authenticate, requireRole('admin', 'elder'), async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'User is already verified' });
        }

        user.isVerified = true;
        user.verifiedBy = req.user._id;
        user.verifiedAt = new Date();
        await user.save();

        // Audit log
        await AuditLog.create({
            action: 'user_verify',
            targetType: 'user',
            targetId: userId,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/users
 * List all users (admin only)
 */
router.get('/users', authenticate, requireRole('admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, verified } = req.query;

        const query = {};
        if (verified !== undefined) {
            query.isVerified = verified === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                users,
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
 * PUT /api/auth/users/:userId/role
 * Update user role (admin only)
 */
router.put('/users/:userId/role', authenticate, requireRole('admin'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'moderator', 'matchmaker', 'elder', 'helper', 'contributor'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Audit log
        await AuditLog.create({
            action: 'user_role_change',
            targetType: 'user',
            targetId: userId,
            performedBy: req.user._id,
            changes: { role },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/auth/users/:userId/verify
 * Verify a user (admin/moderator only)
 */
router.patch('/users/:userId/verify', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'User is already verified' });
        }

        user.isVerified = true;
        user.verifiedBy = req.user._id;
        user.verifiedAt = new Date();
        await user.save();

        // Audit log
        await AuditLog.create({
            action: 'user_verify',
            targetType: 'user',
            targetId: userId,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/auth/users/:userId/status
 * Toggle user active status (admin only)
 */
router.patch('/users/:userId/status', authenticate, requireRole('admin'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Audit log
        await AuditLog.create({
            action: isActive ? 'user_activate' : 'user_deactivate',
            targetType: 'user',
            targetId: userId,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/auth/google
 * Initiate Google OAuth
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // Generate token
        const token = generateToken(req.user._id);

        // Redirect to frontend with token
        // Use process.env.FRONTEND_URL if available, otherwise default to localhost
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

module.exports = router;
