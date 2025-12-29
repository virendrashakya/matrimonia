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
        required: [true, 'Phone is required'],
        unique: true,
        index: true
    },
    email: {
        type: String,
        sparse: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false // Don't include in queries by default
    },

    // Authorization
    role: {
        type: String,
        enum: ['admin', 'moderator', 'matchmaker', 'enduser'],
        default: 'enduser'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,

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
    lastLoginAt: Date

}, { timestamps: true });

// Indexes
UserSchema.index({ role: 1, isVerified: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
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
