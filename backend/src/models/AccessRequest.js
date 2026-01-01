const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        trim: true,
        maxLength: 500
    },
    responseMessage: {
        type: String, // Optional message from owner when approving/rejecting
        trim: true,
        maxLength: 500
    }
}, {
    timestamps: true
});

// Index to prevent duplicate pending requests
accessRequestSchema.index({ requester: 1, targetProfile: 1, status: 1 });

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
