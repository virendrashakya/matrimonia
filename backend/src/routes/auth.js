const express = require('express');
const router = express.Router();
const { User, AuditLog, Profile } = require('../models');
const {
    authenticate,
    requireRole,
    generateToken,
    validate,
    registerSchema,
    loginSchema
} = require('../middleware');
const passport = require('passport');
const speakeasy = require('speakeasy');

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
        const { phone, password, totpToken } = req.validatedBody;

        const user = await User.findOne({ phone }).select('+passwordHash +twoFactorSecret');
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

        // 2FA Check
        if (user.isTwoFactorEnabled) {
            if (!totpToken) {
                return res.status(403).json({
                    error: 'Two-factor authentication required',
                    require2FA: true
                });
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret.base32,
                encoding: 'base32',
                token: totpToken,
                window: 1 // Allow 30sec slack
            });

            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        // Update last login and increment login count
        user.lastLoginAt = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
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
 * POST /api/auth/admin-login
 * Login for Admin/Moderator only (separate portal)
 */
router.post('/admin-login', validate(loginSchema), async (req, res, next) => {
    try {
        const { phone, password, totpToken } = req.validatedBody;

        const user = await User.findOne({ phone }).select('+passwordHash +twoFactorSecret');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Restrict to admin/moderator only
        if (!['admin', 'moderator'].includes(user.role)) {
            return res.status(403).json({ error: 'Access denied. This portal is for administrators only.' });
        }

        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2FA Check
        if (user.isTwoFactorEnabled) {
            if (!totpToken) {
                return res.status(403).json({
                    error: 'Two-factor authentication required',
                    require2FA: true
                });
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret.base32,
                encoding: 'base32',
                token: totpToken,
                window: 1
            });

            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        // Update last login and increment login count
        user.lastLoginAt = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        // Audit log
        await AuditLog.create({
            action: 'admin_login',
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
 * Verify a user (admin/moderator only)
 */
router.put('/verify-user/:userId', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
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
 * PATCH /api/auth/users/:userId/role
 * Update user role (admin only)
 */
router.patch('/users/:userId/role', authenticate, requireRole('admin'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'moderator', 'matchmaker', 'individual'].includes(role)) {
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
 * PUT /api/auth/me/password
 * Change current user's password
 */
router.put('/me/password', authenticate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+passwordHash');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        // Update password
        user.passwordHash = newPassword;
        await user.save();

        // Audit log
        await AuditLog.create({
            action: 'user_password_change',
            targetType: 'user',
            targetId: user._id,
            performedBy: user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/auth/users/:userId/password
 * Force reset user password (Admin/Moderator only)
 */
router.put('/users/:userId/password', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update password
        user.passwordHash = newPassword;
        await user.save();

        // Audit log
        await AuditLog.create({
            action: 'user_password_reset',
            targetType: 'user',
            targetId: user._id,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, message: 'Password reset successfully' });
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
    }
);

// ======================
// 2FA ROUTES
// ======================

/**
 * POST /api/auth/2fa/setup
 * Generate 2FA secret
 */
router.post('/2fa/setup', authenticate, async (req, res, next) => {
    try {
        const secret = speakeasy.generateSecret({
            name: `Pehchan (${req.user.name})`
        });

        // Save secret temporarily (not enabled yet)
        const user = await User.findById(req.user._id);
        user.twoFactorSecret = secret;
        await user.save();

        res.json({
            success: true,
            data: {
                otpauth_url: secret.otpauth_url,
                base32: secret.base32
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/2fa/verify
 * Verify and enable 2FA
 */
router.post('/2fa/verify', authenticate, async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id).select('+twoFactorSecret');

        if (!user.twoFactorSecret) {
            return res.status(400).json({ error: '2FA setup not initiated' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret.base32,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            user.isTwoFactorEnabled = true;
            await user.save();

            await AuditLog.create({
                action: '2fa_enable',
                targetType: 'user',
                targetId: user._id,
                performedBy: user._id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            res.json({ success: true, message: '2FA enabled successfully' });
        } else {
            res.status(400).json({ error: 'Invalid token' });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA (requires password)
 */
router.post('/2fa/disable', authenticate, async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id).select('+passwordHash');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();

        await AuditLog.create({
            action: '2fa_disable',
            targetType: 'user',
            targetId: user._id,
            performedBy: user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, message: '2FA disabled successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/auth/users/:userId/2fa/reset
 * Admin/Moderator reset 2FA
 */
router.put('/users/:userId/2fa/reset', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();

        await AuditLog.create({
            action: '2fa_reset_admin',
            targetType: 'user',
            targetId: user._id,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, message: '2FA has been reset for this user' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/invite
 * Invite a new user (Admin/Moderator only)
 * Creates user and generates setup link
 */
router.post('/invite', authenticate, requireRole('admin', 'moderator'), async (req, res, next) => {
    try {
        const { name, phone, role } = req.body;

        if (!['individual', 'matchmaker'].includes(role)) {
            return res.status(400).json({ error: 'Can only invite Individual or Matchmaker' });
        }

        const existing = await User.findOne({ phone });
        if (existing) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        // Generate Setup Token
        const setupToken = require('crypto').randomBytes(32).toString('hex');
        const setupTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const user = await User.create({
            name,
            phone,
            role,
            setupToken,
            setupTokenExpires,
            isVerified: true, // Verified by mod/admin
            verifiedBy: req.user._id,
            verifiedAt: new Date()
        });

        // Audit log
        await AuditLog.create({
            action: 'user_register', // Using register action for invite
            targetType: 'user',
            targetId: user._id,
            performedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Generate Setup URL
        // Assumes frontend route /setup exists
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8000';
        const setupUrl = `${frontendUrl}/setup?token=${setupToken}`;

        res.json({
            success: true,
            data: {
                setupUrl,
                setupToken, // Return for dev/debug
                expiresAt: setupTokenExpires
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/setup-account
 * Verify setup token and set password
 */
router.post('/setup-account', async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password required' });
        }

        const user = await User.findOne({
            setupToken: token,
            setupTokenExpires: { $gt: Date.now() }
        }).select('+setupToken');

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired setup link' });
        }

        // Set password and clear token
        user.passwordHash = password;
        user.setupToken = undefined;
        user.setupTokenExpires = undefined;
        user.isActive = true;
        await user.save();

        // Audit log
        await AuditLog.create({
            action: 'user_role_change', // Reusing action or creating new one? reusing existing for now
            targetType: 'user',
            targetId: user._id,
            performedBy: user._id,
            changes: { setup: 'completed' },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Auto-login
        const authToken = generateToken(user._id);

        res.json({
            success: true,
            data: {
                user: user.toJSON(),
                token: authToken
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/auth/users/:userId
 * Permanently delete user and their profiles (Admin only)
 */
router.delete('/users/:userId', authenticate, requireRole('admin'), async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 1. Delete all profiles created by this user
        const deleteResult = await Profile.deleteMany({ createdBy: userId });

        // 2. Delete the user
        await User.findByIdAndDelete(userId);

        // 3. Audit log
        await AuditLog.create({
            action: 'user_delete',
            targetType: 'user',
            targetId: userId,
            performedBy: req.user._id,
            changes: {
                deletedProfilesCount: deleteResult.deletedCount,
                userName: user.name,
                userPhone: user.phone
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `User and ${deleteResult.deletedCount} associated profiles deleted successfully`
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
