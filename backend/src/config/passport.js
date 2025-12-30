const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, AuditLog } = require('../models');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ Google OAuth credentials missing. Google Sign-In will not work.');
} else {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists by googleId
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // Update last login
                user.lastLoginAt = new Date();
                // Update avatar if changed (optional)
                if (profile.photos && profile.photos.length > 0) {
                    user.avatar = profile.photos[0].value;
                }
                await user.save();

                // Audit log for login
                await AuditLog.create({
                    action: 'user_login_google',
                    targetType: 'user',
                    targetId: user._id,
                    performedBy: user._id,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });

                return done(null, user);
            }

            // Check if user exists by email
            if (profile.emails && profile.emails.length > 0) {
                const email = profile.emails[0].value;
                user = await User.findOne({ email });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    user.lastLoginAt = new Date();
                    if (profile.photos && profile.photos.length > 0 && !user.avatar) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();

                    // Audit log for linking
                    await AuditLog.create({
                        action: 'user_link_google',
                        targetType: 'user',
                        targetId: user._id,
                        performedBy: user._id,
                        ipAddress: req.ip,
                        userAgent: req.get('User-Agent')
                    });

                    return done(null, user);
                }
            }

            // Create new user
            const newUser = {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : undefined,
                avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
                isVerified: true, // Auto-verify email-based accounts? Maybe keep false for safety or true if trusting Google
                lastLoginAt: new Date()
            };

            user = await User.create(newUser);

            // Audit log for registration
            await AuditLog.create({
                action: 'user_register_google',
                targetType: 'user',
                targetId: user._id,
                performedBy: user._id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            done(null, user);

        } catch (err) {
            done(err, null);
        }
    }));


}

module.exports = passport;
