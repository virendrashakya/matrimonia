const mongoose = require('mongoose');

/**
 * Audit Log - Tracks all significant actions for security and compliance
 */
const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'user_register', 'user_login', 'admin_login', 'moderator_login', 'user_verify',
            'user_role_change', 'user_activate', 'user_deactivate', 'user_block', 'user_unblock',
            'user_password_change', 'user_password_reset', 'user_delete', 'role_change',
            '2fa_enable', '2fa_disable', '2fa_reset_admin',
            'profile_create', 'profile_update', 'profile_delete', 'profile_status_change',
            'recognition_add',
            'fraud_flag', 'fraud_unflag',
            'upload_photo', 'upload_biodata',
            'config_update'
        ]
    },
    targetType: {
        type: String,
        required: true,
        enum: ['user', 'profile', 'recognition']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    changes: {
        type: mongoose.Schema.Types.Mixed // Before/after for updates
    },

    ipAddress: String,
    userAgent: String,

    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }

}, {
    timestamps: false,
    collection: 'audit_logs'
});

// Indexes for querying audit logs
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
