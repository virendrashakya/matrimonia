/**
 * Interest Model - For expressing and tracking matrimonial interests between profiles
 */

const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    // Profile expressing interest
    fromProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    // Profile receiving interest
    toProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    // User who expressed interest (might not own fromProfile, e.g., family member)
    expressedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Status of the interest
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    // Optional message with interest
    message: {
        type: String,
        maxlength: 500
    },
    // When was it responded to
    respondedAt: Date,
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Response message
    responseMessage: {
        type: String,
        maxlength: 500
    },
}, {
    timestamps: true
});

// Compound index to ensure unique interest between profile pairs
interestSchema.index({ fromProfile: 1, toProfile: 1 }, { unique: true });

// Index for efficient queries
interestSchema.index({ toProfile: 1, status: 1 });
interestSchema.index({ fromProfile: 1, status: 1 });
interestSchema.index({ expressedBy: 1 });

/**
 * Check if there's a mutual interest (match)
 */
interestSchema.statics.checkMatch = async function (profileA, profileB) {
    const interestAtoB = await this.findOne({
        fromProfile: profileA,
        toProfile: profileB,
        status: 'accepted'
    });
    const interestBtoA = await this.findOne({
        fromProfile: profileB,
        toProfile: profileA,
        status: 'accepted'
    });
    return !!(interestAtoB && interestBtoA);
};

/**
 * Get all matches for a profile
 */
interestSchema.statics.getMatches = async function (profileId) {
    // Get all profiles that have mutually accepted interests
    const sentAccepted = await this.find({
        fromProfile: profileId,
        status: 'accepted'
    }).select('toProfile');

    const matches = [];
    for (const interest of sentAccepted) {
        const reverseInterest = await this.findOne({
            fromProfile: interest.toProfile,
            toProfile: profileId,
            status: 'accepted'
        });
        if (reverseInterest) {
            matches.push(interest.toProfile);
        }
    }
    return matches;
};

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;
