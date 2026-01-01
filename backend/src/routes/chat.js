const express = require('express');
const router = express.Router();
const { ChatRequest, Conversation, Message, User, Profile } = require('../models');
const { authenticate } = require('../middleware');

// ===========================
// CHAT REQUESTS
// ===========================

// POST /api/chat/request/:userId
// Send a chat request
router.post('/request/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const requesterId = req.user._id;

        if (userId === requesterId.toString()) {
            return res.status(400).json({ error: 'Cannot chat with yourself' });
        }

        // Check availability
        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Check existing request
        const existingRequest = await ChatRequest.findOne({
            requester: requesterId,
            recipient: userId,
            status: 'pending' // Only check pending, if rejected can request again? Maybe not.
        });

        // If there was a rejected request, maybe allow new one? For now simple logic.

        if (existingRequest) {
            return res.status(400).json({ error: 'Request already pending' });
        }

        // Check existing conversation
        const existingConv = await Conversation.findOne({
            participants: { $all: [requesterId, userId] },
            isActive: true
        });
        if (existingConv) {
            return res.status(400).json({ error: 'Conversation already exists' });
        }

        const newRequest = await ChatRequest.create({
            requester: requesterId,
            recipient: userId,
            message: req.body.message
        });

        res.json({ success: true, data: newRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/chat/status/:userId
// Check if I can chat with this user
router.get('/status/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        // Check for active conversation
        const conversation = await Conversation.findOne({
            participants: { $all: [myId, userId] },
            isActive: true
        });

        if (conversation) {
            return res.json({ success: true, status: 'connected', conversationId: conversation._id });
        }

        // Check for pending request (sent by me)
        const sentRequest = await ChatRequest.findOne({
            requester: myId,
            recipient: userId,
            status: 'pending'
        });

        if (sentRequest) {
            return res.json({ success: true, status: 'pending_sent', requestId: sentRequest._id });
        }

        // Check for pending request (received by me)
        const receivedRequest = await ChatRequest.findOne({
            requester: userId,
            recipient: myId,
            status: 'pending'
        });

        if (receivedRequest) {
            return res.json({ success: true, status: 'pending_received', requestId: receivedRequest._id });
        }

        // Check rejection? 
        const rejected = await ChatRequest.findOne({
            $or: [
                { requester: myId, recipient: userId },
                { requester: userId, recipient: myId }
            ],
            status: 'rejected'
        }).sort({ updatedAt: -1 });

        if (rejected) {
            return res.json({ success: true, status: 'rejected' });
        }

        res.json({ success: true, status: 'none' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/chat/requests
// Get pending requests (received)
router.get('/requests', authenticate, async (req, res) => {
    try {
        const requests = await ChatRequest.find({ recipient: req.user._id, status: 'pending' })
            .populate('requester', 'name email phone') // basic info
            .sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/chat/request/:id
// Accept or Reject
router.put('/request/:id', authenticate, async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const request = await ChatRequest.findOne({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!request) return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ error: 'Request already processed' });

        request.status = status;
        await request.save();

        if (status === 'accepted') {
            // Create Conversation
            const conversation = await Conversation.create({
                participants: [request.requester, request.recipient],
                lastMessage: {
                    content: 'Chat request accepted',
                    sender: request.recipient, // Current user accepted
                    timestamp: new Date()
                }
            });

            // Clean up other requests? optional
            return res.json({ success: true, data: { request, conversation } });
        }

        res.json({ success: true, data: { request } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===========================
// CONVERSATIONS
// ===========================

// GET /api/chat/conversations
// List my conversations
router.get('/conversations', authenticate, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
            isActive: true
        })
            .populate('participants', 'name email') // In real app, might want profile photo too
            .sort({ 'lastMessage.timestamp': -1 });

        res.json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/chat/messages/:conversationId
// Get history
router.get('/messages/:conversationId', authenticate, async (req, res) => {
    try {
        // Verify participation
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            participants: req.user._id
        });

        if (!conversation) return res.status(403).json({ error: 'Not authorized or found' });

        const messages = await Message.find({ conversationId: req.params.conversationId })
            .sort({ createdAt: 1 }) // Chronological
            .populate('sender', 'name');

        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
