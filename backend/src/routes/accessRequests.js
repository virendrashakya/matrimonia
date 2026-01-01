const express = require('express');
const router = express.Router();
const { Profile, AccessRequest, Notification } = require('../models');
const { authenticate } = require('../middleware');

/**
 * POST /api/access-requests/:profileId
 * Send a request to view a restricted profile
 */
router.post('/:profileId', authenticate, async (req, res, next) => {
    try {
        const { message } = req.body;
        const profile = await Profile.findById(req.params.profileId);

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Check if self
        if (profile.createdBy.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'You own this profile' });
        }

        // Check if already has access
        if (profile.accessWhitelist?.includes(req.user._id)) {
            return res.status(400).json({ error: 'You already have access to this profile' });
        }

        // Check for existing pending request
        const existingRequest = await AccessRequest.findOne({
            requester: req.user._id,
            targetProfile: profile._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'Request already pending' });
        }

        const request = await AccessRequest.create({
            requester: req.user._id,
            targetProfile: profile._id,
            message
        });

        // Create Notification for Owner
        await Notification.create({
            recipient: profile.createdBy,
            type: 'access_request',
            title: 'New Access Request',
            titleHi: 'नया एक्सेस अनुरोध',
            message: `${req.user.name} requested to view profile ${profile.customId || profile.fullName}`,
            messageHi: `${req.user.name} ने प्रोफ़ाइल देखने का अनुरोध किया है`,
            data: { requestId: request._id, profileId: profile._id }
        });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/access-requests/received
 * List requests received for profiles owned by user
 */
router.get('/received', authenticate, async (req, res, next) => {
    try {
        // Find all profiles owned by user
        const myProfiles = await Profile.find({ createdBy: req.user._id }).select('_id');
        const myProfileIds = myProfiles.map(p => p._id);

        const requests = await AccessRequest.find({ targetProfile: { $in: myProfileIds } })
            .populate('requester', 'name email phone')
            .populate('targetProfile', 'fullName customId photos')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/access-requests/sent
 * List requests sent by user
 */
router.get('/sent', authenticate, async (req, res, next) => {
    try {
        const requests = await AccessRequest.find({ requester: req.user._id })
            .populate('targetProfile', 'fullName customId photos')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/access-requests/:id
 * Approve/Reject request
 */
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { status, responseMessage } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const request = await AccessRequest.findById(req.params.id)
            .populate('targetProfile');

        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Verify ownership
        if (request.targetProfile.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        request.status = status;
        request.responseMessage = responseMessage;
        await request.save();

        if (status === 'approved') {
            // Add requester to profile whitelist
            await Profile.findByIdAndUpdate(request.targetProfile._id, {
                $addToSet: { accessWhitelist: request.requester }
            });

            // Notify Requester
            await Notification.create({
                recipient: request.requester,
                type: 'access_approved',
                title: 'Access Granted',
                titleHi: 'एक्सेस स्वीकृत',
                message: `Your request to view ${request.targetProfile.fullName} has been approved`,
                messageHi: `${request.targetProfile.fullName} को देखने का आपका अनुरोध स्वीकृत हो गया है`,
                data: { profileId: request.targetProfile._id }
            });
        } else {
            // Notify Requester (Rejection)
            await Notification.create({
                recipient: request.requester,
                type: 'access_rejected',
                title: 'Access Denied',
                titleHi: 'एक्सेस अस्वीकृत',
                message: `Your request to view ${request.targetProfile.fullName} was denied`,
                messageHi: `${request.targetProfile.fullName} को देखने का आपका अनुरोध अस्वीकार कर दिया गया`,
                data: { profileId: request.targetProfile._id }
            });
        }

        res.json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
