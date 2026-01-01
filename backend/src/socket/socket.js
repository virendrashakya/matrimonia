const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Conversation, Message, User, ChatRequest } = require('../models');

let io;

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
            const user = await User.findById(decoded.id);

            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

        // Join a room with their own user ID for direct notifications/calls
        socket.join(socket.user._id.toString());

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

        // WebRTC Signaling Events
        socket.on('call_user', async ({ userToCall, signalData, from, name }) => {
            // Check permission: Request accepted?
            // For now, strict check: Are they in an active conversation?
            // Optimization: Just check allowed list or trust client logic + simplified backend check
            const allowed = await ChatRequest.findOne({
                $or: [
                    { requester: socket.user._id, recipient: userToCall, status: 'accepted' },
                    { requester: userToCall, recipient: socket.user._id, status: 'accepted' }
                ]
            });

            if (allowed) {
                io.to(userToCall).emit("call_user", { signal: signalData, from, name });
            } else {
                socket.emit("call_error", "Not allowed to call this user");
            }
        });

        socket.on("answer_call", (data) => {
            io.to(data.to).emit("call_accepted", data.signal);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
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
