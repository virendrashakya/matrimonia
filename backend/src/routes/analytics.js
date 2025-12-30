/**
 * Analytics Routes - Profile views, engagement stats
 */

const express = require('express');
const router = express.Router();
const { ProfileView, Profile, Interest, Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

// Record a profile view
router.post('/view/:profileId', authenticate, async (req, res) => {
    try {
        const { profileId } = req.params;
        const { source = 'direct' } = req.body;
        const viewerId = req.user._id;

        // Get the profile to find owner
        const profile = await Profile.findById(profileId).select('createdBy');
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        // Don't record self-views
        if (profile.createdBy.toString() === viewerId.toString()) {
            return res.json({ success: true, message: 'Self view not recorded' });
        }

        // Record the view
        await ProfileView.recordView(viewerId, profileId, profile.createdBy, source);

        // Increment viewCount on the profile
        await Profile.findByIdAndUpdate(profileId, { $inc: { viewCount: 1 } });

        // Create notification for profile owner (debounced - only if not notified in last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingNotification = await Notification.findOne({
            userId: profile.createdBy,
            type: 'profile_viewed',
            relatedProfile: profileId,
            'data.viewerId': viewerId,
            createdAt: { $gte: oneDayAgo }
        });

        if (!existingNotification) {
            await Notification.create({
                userId: profile.createdBy,
                type: 'profile_viewed',
                title: 'Someone viewed your profile',
                titleHi: 'किसी ने आपकी प्रोफ़ाइल देखी',
                message: 'Your profile was viewed by someone',
                messageHi: 'आपकी प्रोफ़ाइल किसी ने देखी',
                data: {
                    profileId: profileId,
                    viewerId: viewerId,
                    actionUrl: `/profiles/${profileId}`
                }
            });
        }

        res.json({ success: true, message: 'View recorded' });
    } catch (error) {
        console.error('Record view error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get view analytics for current user's profiles
router.get('/my-analytics', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get analytics
        const analytics = await ProfileView.getOwnerAnalytics(userId);

        // Get recent viewers
        const recentViews = await ProfileView.find({ profileOwner: userId })
            .populate('viewer', 'name')
            .populate('profile', 'fullName')
            .sort({ viewedAt: -1 })
            .limit(10);

        // Get interest stats
        const [interestsSent, interestsReceived, matches] = await Promise.all([
            Interest.countDocuments({ fromUser: userId }),
            Interest.countDocuments({ toUser: userId }),
            Interest.countDocuments({
                $or: [
                    { fromUser: userId, isMatch: true },
                    { toUser: userId, isMatch: true }
                ]
            })
        ]);

        res.json({
            success: true,
            data: {
                views: analytics,
                recentViewers: recentViews.map(v => ({
                    viewerName: v.viewer?.name || 'Anonymous',
                    profileName: v.profile?.fullName,
                    viewedAt: v.viewedAt,
                    source: v.source
                })),
                interests: {
                    sent: interestsSent,
                    received: interestsReceived,
                    matches
                }
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get who viewed a specific profile
router.get('/viewers/:profileId', authenticate, async (req, res) => {
    try {
        const { profileId } = req.params;
        const userId = req.user._id;

        // Verify ownership
        const profile = await Profile.findById(profileId).select('createdBy');
        if (!profile || profile.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const viewers = await ProfileView.getViewers(profileId, 50);
        const viewCount = await ProfileView.getViewCount(profileId);

        res.json({
            success: true,
            data: {
                totalViews: viewCount,
                viewers: viewers.map(v => ({
                    name: v.viewer?.name || 'Anonymous',
                    viewedAt: v.viewedAt,
                    source: v.source
                }))
            }
        });
    } catch (error) {
        console.error('Get viewers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get view count for a profile (public - just count)
router.get('/view-count/:profileId', async (req, res) => {
    try {
        const { profileId } = req.params;
        const count = await ProfileView.getViewCount(profileId);

        res.json({
            success: true,
            data: { viewCount: count }
        });
    } catch (error) {
        console.error('View count error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get profiles I've viewed recently
router.get('/my-viewed', authenticate, async (req, res) => {
    try {
        const viewed = await ProfileView.getViewedByUser(req.user._id, 20);

        res.json({
            success: true,
            data: {
                profiles: viewed.map(v => ({
                    profile: v.profile,
                    viewedAt: v.viewedAt
                }))
            }
        });
    } catch (error) {
        console.error('My viewed error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
