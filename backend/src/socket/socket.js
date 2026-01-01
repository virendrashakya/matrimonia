const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Conversation, Message, User, ChatRequest } = require('../models');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:8000",
            methods: ["GET", "POST"]
        }
    });

    // Middleware to authenticate socket connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);

            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        console.log(`User connected: ${socket.user.name} (${userId})`);

        // Track online users
        onlineUsers.set(userId, socket.id);
        io.emit('get_online_users', Array.from(onlineUsers.keys()));

        // Join a room with their own user ID for direct notifications/calls
        socket.join(userId);

        socket.on('join_conversation', (conversationId) => {
            if (conversationId) {
                socket.join(conversationId);
                console.log(`User ${socket.user._id} joined conversation ${conversationId}`);
            }
        });

        socket.on('send_message', async (data) => {
            try {
                const { conversationId, content, type = 'text' } = data;

                // Validate if user acts in this conversation
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user._id,
                    isActive: true
                });

                if (!conversation) {
                    return socket.emit('error', 'Conversation not found or inactive');
                }

                const newMessage = await Message.create({
                    conversationId,
                    sender: socket.user._id,
                    content,
                    type,
                    readBy: [socket.user._id]
                });

                // Update conversation last message
                conversation.lastMessage = {
                    content: type === 'text' ? content : `Sent a ${type}`,
                    sender: socket.user._id,
                    timestamp: new Date()
                };
                await conversation.save();

                // Populate sender details for realtime UI
                await newMessage.populate('sender', 'name email');

                // Emit to room
                io.to(conversationId).emit('receive_message', newMessage);

                // Notify other participants (if not in room/for badge count)
                conversation.participants.forEach(pId => {
                    if (pId.toString() !== socket.user._id.toString()) {
                        io.to(pId.toString()).emit('notification', {
                            type: 'new_message',
                            message: newMessage,
                            conversationId
                        });
                    }
                });

            } catch (error) {
                console.error('Socket message error:', error);
                socket.emit('error', 'Message sending failed');
            }
        });

        socket.on('typing', ({ conversationId }) => {
            if (conversationId) {
                socket.to(conversationId).emit('user_typing', {
                    conversationId,
                    userId: socket.user._id,
                    name: socket.user.name
                });
            }
        });

        socket.on('stop_typing', ({ conversationId }) => {
            if (conversationId) {
                socket.to(conversationId).emit('user_stop_typing', {
                    conversationId,
                    userId: socket.user._id
                });
            }
        });

        // WebRTC Signaling Events
        socket.on('call_user', async ({ userToCall, signalData, from, name }) => {
            try {
                const callerId = socket.user._id.toString();
                // Handle userToCall being an object or a string
                const recipientId = typeof userToCall === 'string'
                    ? userToCall
                    : (userToCall?._id?.toString() || userToCall?.toString());

                console.log(`[SIGNAL] Call attempt: ${callerId} -> ${recipientId}`);

                // Check permission: Request accepted?
                const allowed = await ChatRequest.findOne({
                    $or: [
                        { requester: callerId, recipient: recipientId, status: 'accepted' },
                        { requester: recipientId, recipient: callerId, status: 'accepted' }
                    ]
                });

                if (allowed) {
                    console.log(`[SIGNAL] Call allowed. Sending signal to room: ${recipientId}`);
                    io.to(recipientId).emit("call_user", { signal: signalData, from, name });
                } else {
                    console.warn(`[SIGNAL] Call denied: No 'accepted' chat request between ${callerId} and ${recipientId}`);
                    // List active requests for debugging
                    const existing = await ChatRequest.findOne({
                        $or: [
                            { requester: callerId, recipient: recipientId },
                            { requester: recipientId, recipient: callerId }
                        ]
                    });
                    console.log(`[SIGNAL] Found existing request: ${existing?.status || 'none'}`);
                    socket.emit("call_error", "Not allowed to call this user. Ensure chat request is accepted.");
                }
            } catch (error) {
                console.error("Signaling error:", error);
                socket.emit("call_error", "Internal signaling error");
            }
        });

        socket.on("answer_call", (data) => {
            io.to(data.to).emit("call_accepted", data.signal);
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('get_online_users', Array.from(onlineUsers.keys()));
            console.log(`User disconnected: ${userId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initializeSocket, getIO };
