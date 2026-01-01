const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String, // Optional initial message
        maxLength: 500
    }
}, {
    timestamps: true
});

// Prevent duplicate pending requests
chatRequestSchema.index({ requester: 1, recipient: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
