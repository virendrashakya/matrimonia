const mongoose = require('mongoose');

/**
 * Recognition Ledger - Append-Only
 * This collection tracks all recognition entries with chain hashing for integrity.
 * Entries are NEVER modified or deleted.
 */
const RecognitionEntrySchema = new mongoose.Schema({
    // What profile is being recognised
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
        index: true
    },

    // Who is providing the recognition
    recogniserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Recognition Details
    type: {
        type: String,
        enum: ['know_personally', 'know_family', 'verified_documents', 'community_reference'],
        required: [true, 'Recognition type is required']
    },
    relationship: String, // "neighbor", "colleague", "family friend"
    notes: {
        type: String,
        maxLength: 500
    },

    // Weight (computed at write time based on recogniser's role)
    baseWeight: {
        type: Number,
        required: true
    },
    recogniserRole: {
        type: String,
        required: true
    },

    // Decay tracking (updated by background job)
    decayedWeight: Number,
    lastDecayAt: Date,

    // Integrity - blockchain-style chaining
    entryHash: String, // SHA256 of profileId + recogniserId + type + timestamp
    previousEntryHash: String, // Chain link for tamper detection

    // Audit (immutable after creation)
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    ipAddress: String,
    userAgent: String

}, {
    timestamps: false, // We manage createdAt manually, no updates allowed
    collection: 'recognition_ledger'
});

// CRITICAL: Prevent duplicate recognition (same person, same type)
RecognitionEntrySchema.index(
    { profileId: 1, recogniserId: 1, type: 1 },
    { unique: true }
);

// For computing scores efficiently
RecognitionEntrySchema.index({ profileId: 1, createdAt: -1 });

module.exports = mongoose.model('RecognitionEntry', RecognitionEntrySchema);
