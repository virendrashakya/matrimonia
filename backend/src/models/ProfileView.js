/**
 * ProfileView - Track who viewed which profiles
 */

const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
    // Who viewed
    viewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Which profile was viewed
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    // Profile owner (denormalized for faster queries)
    profileOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // View timestamp
    viewedAt: {
        type: Date,
        default: Date.now
    },
    // Source of view (search, direct, recommendation, etc.)
    source: {
        type: String,
        enum: ['search', 'direct', 'recommendation', 'shared', 'qr', 'whatsapp', 'other'],
        default: 'direct'
    },
    // Device info (optional)
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown'
    }
}, {
    timestamps: true
});

// Indexes for faster queries
profileViewSchema.index({ profile: 1, viewedAt: -1 });
profileViewSchema.index({ viewer: 1, viewedAt: -1 });
profileViewSchema.index({ profileOwner: 1, viewedAt: -1 });
profileViewSchema.index({ profile: 1, viewer: 1, viewedAt: -1 });

// Static: Record a view (with debouncing - no duplicate within 1 hour)
profileViewSchema.statics.recordView = async function (viewerId, profileId, profileOwnerId, source = 'direct') {
    // Check if same viewer viewed same profile in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentView = await this.findOne({
        viewer: viewerId,
        profile: profileId,
        viewedAt: { $gte: oneHourAgo }
    });

    if (recentView) {
        // Already viewed recently, just update timestamp
        recentView.viewedAt = new Date();
        return recentView.save();
    }

    // Create new view record
    return this.create({
        viewer: viewerId,
        profile: profileId,
        profileOwner: profileOwnerId,
        source
    });
};

// Static: Get view count for a profile
profileViewSchema.statics.getViewCount = async function (profileId, period = 'all') {
    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            dateFilter = {
                viewedAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
            };
            break;
        case 'week':
            dateFilter = {
                viewedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            };
            break;
        case 'month':
            dateFilter = {
                viewedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            };
            break;
        default:
            dateFilter = {};
    }

    return this.countDocuments({ profile: profileId, ...dateFilter });
};

// Static: Get who viewed a profile
profileViewSchema.statics.getViewers = async function (profileId, limit = 20) {
    return this.find({ profile: profileId })
        .populate('viewer', 'name email phone')
        .sort({ viewedAt: -1 })
        .limit(limit);
};

// Static: Get profiles viewed by a user
profileViewSchema.statics.getViewedByUser = async function (userId, limit = 20) {
    return this.find({ viewer: userId })
        .populate('profile', 'fullName photos city age caste')
        .sort({ viewedAt: -1 })
        .limit(limit);
};

// Static: Get analytics for a profile owner
profileViewSchema.statics.getOwnerAnalytics = async function (ownerId) {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalViews, todayViews, weekViews, monthViews, uniqueViewers] = await Promise.all([
        this.countDocuments({ profileOwner: ownerId }),
        this.countDocuments({ profileOwner: ownerId, viewedAt: { $gte: today } }),
        this.countDocuments({ profileOwner: ownerId, viewedAt: { $gte: weekAgo } }),
        this.countDocuments({ profileOwner: ownerId, viewedAt: { $gte: monthAgo } }),
        this.distinct('viewer', { profileOwner: ownerId }).then(arr => arr.length)
    ]);

    return {
        totalViews,
        todayViews,
        weekViews,
        monthViews,
        uniqueViewers
    };
};

module.exports = mongoose.model('ProfileView', profileViewSchema);
