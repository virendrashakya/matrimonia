/**
 * Access Control Routes - Manage profile visibility and access requests
 */

const express = require('express');
const router = express.Router();
const { Profile, AccessRequest, Notification } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * PATCH /api/access/visibility/:profileId
 * Update profile visibility (owner only)
 */
router.patch('/visibility/:profileId', authenticate, async (req, res) => {
    try {
        const { profileId } = req.params;
        const { visibility } = req.body;

        if (!['public', 'restricted', 'private'].includes(visibility)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid visibility. Must be: public, restricted, or private'
            });
        }

        const profile = await Profile.findById(profileId);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        // Check ownership
        if (profile.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        profile.visibility = visibility;
        await profile.save();

        res.json({
            success: true,
            message: `Profile visibility updated to ${visibility}`,
            data: { visibility: profile.visibility }
        });
    } catch (error) {
        console.error('Update visibility error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * POST /api/access/request/:profileId
 * Request access to a restricted profile
 */
router.post('/request/:profileId', authenticate, async (req, res) => {
    try {
        const { profileId } = req.params;
        const { message = '' } = req.body;
        const requesterId = req.user._id;

        const profile = await Profile.findById(profileId).select('createdBy visibility fullName');
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        // Can't request access to own profile
        if (profile.createdBy.toString() === requesterId.toString()) {
            return res.status(400).json({ success: false, error: 'Cannot request access to own profile' });
        }

        // Only need to request for restricted profiles
        if (profile.visibility === 'public') {
            return res.json({ success: true, message: 'Profile is public, no request needed', hasAccess: true });
        }

        if (profile.visibility === 'private') {
            return res.status(403).json({ success: false, error: 'This profile is private' });
        }

        // Create or update access request
        const request = await AccessRequest.createRequest(
            requesterId,
            profileId,
            profile.createdBy,
            message
        );

        // Notify profile owner if new request
        if (request.status === 'pending') {
            await Notification.create({
                userId: profile.createdBy,
                type: 'access_request',
                title: {
                    en: 'New Profile Access Request',
                    hi: 'नई प्रोफ़ाइल एक्सेस अनुरोध'
                },
                message: {
                    en: `Someone wants to view ${profile.fullName}'s complete profile`,
                    hi: `कोई ${profile.fullName} की पूरी प्रोफ़ाइल देखना चाहता है`
                },
                relatedProfile: profileId,
                metadata: { requesterId, requestId: request._id }
            });
        }

        res.json({
            success: true,
            message: request.status === 'approved' ? 'Access already granted' : 'Access request sent',
            data: {
                requestId: request._id,
                status: request.status
            }
        });
    } catch (error) {
        console.error('Request access error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * POST /api/access/respond/:requestId
 * Approve or reject an access request (profile owner only)
 */
router.post('/respond/:requestId', authenticate, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, note = '' } = req.body; // action: 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, error: 'Invalid action. Must be: approve or reject' });
        }

        const request = await AccessRequest.findById(requestId)
            .populate('profile', 'fullName createdBy');

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        // Verify ownership
        if (request.profileOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // Update request status
        request.status = action === 'approve' ? 'approved' : 'rejected';
        request.respondedAt = new Date();
        request.responseNote = note;
        await request.save();

        // If approved, add to allowedViewers
        if (action === 'approve') {
            await Profile.findByIdAndUpdate(request.profile._id, {
                $addToSet: { allowedViewers: request.requester }
            });
        }

        // Notify requester
        await Notification.create({
            userId: request.requester,
            type: 'access_response',
            title: {
                en: action === 'approve' ? 'Access Request Approved!' : 'Access Request Declined',
                hi: action === 'approve' ? 'एक्सेस अनुरोध स्वीकृत!' : 'एक्सेस अनुरोध अस्वीकृत'
            },
            message: {
                en: action === 'approve'
                    ? `Your request to view ${request.profile.fullName}'s profile has been approved`
                    : `Your request to view ${request.profile.fullName}'s profile was declined`,
                hi: action === 'approve'
                    ? `${request.profile.fullName} की प्रोफ़ाइल देखने का आपका अनुरोध स्वीकृत हो गया`
                    : `${request.profile.fullName} की प्रोफ़ाइल देखने का आपका अनुरोध अस्वीकृत हो गया`
            },
            relatedProfile: request.profile._id
        });

        res.json({
            success: true,
            message: action === 'approve' ? 'Access granted' : 'Request rejected',
            data: { status: request.status }
        });
    } catch (error) {
        console.error('Respond to request error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * GET /api/access/pending
 * Get pending access requests for current user's profiles
 */
router.get('/pending', authenticate, async (req, res) => {
    try {
        const requests = await AccessRequest.getPendingForOwner(req.user._id);

        res.json({
            success: true,
            data: {
                requests: requests.map(r => ({
                    id: r._id,
                    requester: {
                        id: r.requester._id,
                        name: r.requester.name,
                        phone: r.requester.phone
                    },
                    profile: {
                        id: r.profile._id,
                        name: r.profile.fullName,
                        photo: r.profile.photos?.find(p => p.isPrimary)?.url || r.profile.photos?.[0]?.url
                    },
                    message: r.message,
                    requestedAt: r.createdAt
                })),
                count: requests.length
            }
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * GET /api/access/check/:profileId
 * Check if current user has access to a profile
 */
router.get('/check/:profileId', authenticate, async (req, res) => {
    try {
        const { profileId } = req.params;
        const userId = req.user._id;

        const profile = await Profile.findById(profileId).select('visibility allowedViewers createdBy');
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        // Owner always has access
        if (profile.createdBy.toString() === userId.toString()) {
            return res.json({ success: true, data: { hasAccess: true, isOwner: true } });
        }

        // Public profiles - everyone has access
        if (profile.visibility === 'public') {
            return res.json({ success: true, data: { hasAccess: true, visibility: 'public' } });
        }

        // Private profiles - no access except owner
        if (profile.visibility === 'private') {
            return res.json({ success: true, data: { hasAccess: false, visibility: 'private' } });
        }

        // Restricted - check if in allowedViewers or has approved request
        const isAllowed = profile.allowedViewers.some(v => v.toString() === userId.toString());

        if (isAllowed) {
            return res.json({ success: true, data: { hasAccess: true, visibility: 'restricted' } });
        }

        // Check pending request
        const request = await AccessRequest.findOne({ requester: userId, profile: profileId });

        res.json({
            success: true,
            data: {
                hasAccess: false,
                visibility: 'restricted',
                requestStatus: request?.status || null
            }
        });
    } catch (error) {
        console.error('Check access error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * POST /api/access/grant/:profileId
 * Grant access to specific user (profile owner only)
 */
router.post('/grant/:profileId', authenticate, async (req, res) => {
    try {
        const { profileId } = req.params;
        const { userId } = req.body;

        const profile = await Profile.findById(profileId);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        if (profile.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await Profile.findByIdAndUpdate(profileId, {
            $addToSet: { allowedViewers: userId }
        });

        res.json({ success: true, message: 'Access granted' });
    } catch (error) {
        console.error('Grant access error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

/**
 * DELETE /api/access/revoke/:profileId/:userId
 * Revoke access from a user (profile owner only)
 */
router.delete('/revoke/:profileId/:userId', authenticate, async (req, res) => {
    try {
        const { profileId, userId } = req.params;

        const profile = await Profile.findById(profileId);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        if (profile.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await Profile.findByIdAndUpdate(profileId, {
            $pull: { allowedViewers: userId }
        });

        // Also update the access request if exists
        await AccessRequest.findOneAndUpdate(
            { requester: userId, profile: profileId },
            { status: 'rejected', respondedAt: new Date() }
        );

        res.json({ success: true, message: 'Access revoked' });
    } catch (error) {
        console.error('Revoke access error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
