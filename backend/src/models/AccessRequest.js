/**
 * AccessRequest Model - Manages requests to view restricted profiles
 */

const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
    // Who is requesting access
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Which profile they want to access
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
        index: true
    },

    // Profile owner (for easy querying)
    profileOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Request status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },

    // Optional message from requester
    message: {
        type: String,
        maxLength: 500
    },

    // Response info
    respondedAt: Date,
    responseNote: String

}, { timestamps: true });

// Compound index for checking existing requests
accessRequestSchema.index({ requester: 1, profile: 1 }, { unique: true });

// Index for finding pending requests by owner
accessRequestSchema.index({ profileOwner: 1, status: 1 });

// Static: Check if user has access to a profile
accessRequestSchema.statics.hasAccess = async function (userId, profileId) {
    const request = await this.findOne({
        requester: userId,
        profile: profileId,
        status: 'approved'
    });
    return !!request;
};

// Static: Get pending requests for a profile owner
accessRequestSchema.statics.getPendingForOwner = async function (ownerId) {
    return this.find({ profileOwner: ownerId, status: 'pending' })
        .populate('requester', 'name phone')
        .populate('profile', 'fullName photos')
        .sort({ createdAt: -1 });
};

// Static: Create request if not exists
accessRequestSchema.statics.createRequest = async function (requesterId, profileId, profileOwnerId, message = '') {
    // Check if request already exists
    const existing = await this.findOne({ requester: requesterId, profile: profileId });

    if (existing) {
        if (existing.status === 'rejected') {
            // Allow re-requesting after rejection
            existing.status = 'pending';
            existing.message = message;
            existing.respondedAt = null;
            existing.responseNote = null;
            return existing.save();
        }
        return existing; // Return existing pending/approved request
    }

    return this.create({
        requester: requesterId,
        profile: profileId,
        profileOwner: profileOwnerId,
        message
    });
};

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
