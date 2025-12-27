/**
 * Notification Model - For in-app notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // User who receives the notification
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Type of notification
    type: {
        type: String,
        enum: [
            'interest_received',    // Someone expressed interest
            'interest_accepted',    // Your interest was accepted
            'interest_rejected',    // Your interest was rejected
            'match_found',          // Mutual interest = match!
            'recognition_received', // Profile got recognized
            'profile_viewed',       // Someone viewed your profile
            'system',               // System notifications
            'verification',         // Verification status
        ],
        required: true
    },
    // Notification title
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    titleHi: {
        type: String,
        maxlength: 200
    },
    // Notification message
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    messageHi: {
        type: String,
        maxlength: 500
    },
    // Additional data (e.g., profile ID, interest ID)
    data: {
        profileId: mongoose.Schema.Types.ObjectId,
        interestId: mongoose.Schema.Types.ObjectId,
        actionUrl: String,
    },
    // Read status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: Date,
}, {
    timestamps: true
});

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Static to create interest notification
notificationSchema.statics.createInterestNotification = async function (
    userId,
    type,
    fromProfileName,
    profileId,
    interestId
) {
    const notifications = {
        interest_received: {
            title: `${fromProfileName} expressed interest`,
            titleHi: `${fromProfileName} ने रुचि व्यक्त की`,
            message: `View the profile and respond to their interest`,
            messageHi: `प्रोफ़ाइल देखें और उनकी रुचि का जवाब दें`,
        },
        interest_accepted: {
            title: `Your interest was accepted!`,
            titleHi: `आपकी रुचि स्वीकार की गई!`,
            message: `${fromProfileName} accepted your interest. It's a match!`,
            messageHi: `${fromProfileName} ने आपकी रुचि स्वीकार की। यह एक मैच है!`,
        },
        match_found: {
            title: `You have a new match! 🎉`,
            titleHi: `आपका एक नया मैच है! 🎉`,
            message: `You and ${fromProfileName} have mutually expressed interest`,
            messageHi: `आपने और ${fromProfileName} ने आपसी रुचि व्यक्त की है`,
        },
    };

    const notif = notifications[type];
    if (!notif) return null;

    return this.create({
        userId,
        type,
        title: notif.title,
        titleHi: notif.titleHi,
        message: notif.message,
        messageHi: notif.messageHi,
        data: { profileId, interestId, actionUrl: `/profiles/${profileId}` }
    });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
