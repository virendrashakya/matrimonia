const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Identity
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: 100
    },

    phone: {
        type: String,
        unique: true,
        sparse: true, // Allow null/undefined to be non-unique (for OAuth users who might not have phone initially)
        index: true,
        validate: {
            validator: function (v) {
                // If value is null/undefined/empty, mongoose might skip? 
                // With sparse: true, we rely on 'required' at the endpoint level or 'required: true' if needed.
                // Here we just validate format if present.
                if (!v) return true;
                return /^[6-9]\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid Indian mobile number!`
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    avatar: {
        type: String
    },
    email: {
        type: String,
        sparse: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: function () {
            // Required if NOT Google auth AND NOT invited (has setupToken)
            return !this.googleId && !this.setupToken;
        },
        select: false // Don't include in queries by default
    },

    // Authorization
    role: {
        type: String,
        enum: ['admin', 'moderator', 'matchmaker', 'individual'],
        default: 'individual'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Two Factor Authentication
    twoFactorSecret: {
        type: Object, // Stores { ascii, hex, base32, otpauth_url }
        select: false
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,

    // Account Setup (for invited users)
    setupToken: {
        type: String,
        select: false
    },
    setupTokenExpires: Date,

    // Agency Info (for matchmakers)
    agency: {
        name: { type: String, trim: true },
        registrationNumber: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        website: { type: String, trim: true },
        establishedYear: { type: Number },
        description: { type: String, maxLength: 500 }
    },

    // Preferences
    preferredLanguage: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    },

    // Audit
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: Date,
    loginCount: {
        type: Number,
        default: 0
    },
    loginHistory: [{
        ip: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now }
    }]

}, { timestamps: true });

// Indexes
UserSchema.index({ role: 1, isVerified: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash') || !this.passwordHash) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON output
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

module.exports = mongoose.model('User', UserSchema);
