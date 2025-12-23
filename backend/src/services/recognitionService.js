const crypto = require('crypto');
const { User, Profile, RecognitionEntry, AuditLog } = require('../models');
const { RECOGNITION_WEIGHTS, getRecognitionLevel } = require('../config/recognitionWeights');

/**
 * Calculate recognition score for a profile with decay
 */
async function calculateRecognitionScore(profileId) {
    const entries = await RecognitionEntry.find({ profileId }).sort({ createdAt: -1 });

    let totalScore = 0;
    const uniqueRecognisers = new Set();
    const now = Date.now();

    for (const entry of entries) {
        uniqueRecognisers.add(entry.recogniserId.toString());

        // Calculate time-decayed weight
        const ageWeeks = (now - entry.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000);
        const decayFactor = Math.pow(0.5, ageWeeks / RECOGNITION_WEIGHTS.decay.halfLifeWeeks);
        const decayedWeight = Math.max(
            entry.baseWeight * decayFactor,
            entry.baseWeight * RECOGNITION_WEIGHTS.decay.minWeight
        );

        totalScore += decayedWeight;
    }

    const level = getRecognitionLevel(totalScore);

    return {
        score: Math.round(totalScore * 10) / 10,
        level,
        recogniserCount: uniqueRecognisers.size,
        lastRecognitionAt: entries[0]?.createdAt || null
    };
}

/**
 * Add a recognition entry
 * @throws {Error} if validation fails
 */
async function addRecognition(profileId, recogniserId, type, relationship, notes, ipAddress, userAgent) {
    // 1. Validate recogniser is verified
    const recogniser = await User.findById(recogniserId);
    if (!recogniser) {
        throw new Error('Recogniser not found');
    }
    if (!recogniser.isVerified) {
        throw new Error('Only verified users can recognise profiles');
    }

    // 2. Validate profile exists and is active
    const profile = await Profile.findById(profileId);
    if (!profile) {
        throw new Error('Profile not found');
    }
    if (profile.status === 'deleted') {
        throw new Error('Cannot recognise a deleted profile');
    }

    // 3. Check for duplicate (will also fail at DB level due to unique index)
    const existing = await RecognitionEntry.findOne({
        profileId,
        recogniserId,
        type
    });
    if (existing) {
        throw new Error('You have already provided this type of recognition for this profile');
    }

    // 4. Calculate weight
    const roleWeight = RECOGNITION_WEIGHTS.roles[recogniser.role] || 1;
    const typeMultiplier = RECOGNITION_WEIGHTS.types[type] || 1;
    const baseWeight = roleWeight * typeMultiplier;

    // 5. Get previous entry for chain hash
    const lastEntry = await RecognitionEntry.findOne({ profileId }).sort({ createdAt: -1 });

    // 6. Create entry hash for integrity
    const timestamp = Date.now();
    const entryData = `${profileId}|${recogniserId}|${type}|${timestamp}`;
    const entryHash = crypto.createHash('sha256').update(entryData).digest('hex');

    // 7. Create the recognition entry
    const entry = await RecognitionEntry.create({
        profileId,
        recogniserId,
        type,
        relationship,
        notes,
        baseWeight,
        recogniserRole: recogniser.role,
        decayedWeight: baseWeight,
        entryHash,
        previousEntryHash: lastEntry?.entryHash || null,
        ipAddress,
        userAgent
    });

    // 8. Update profile's denormalized recognition score
    const newRecognition = await calculateRecognitionScore(profileId);
    await Profile.findByIdAndUpdate(profileId, {
        recognition: newRecognition
    });

    // 9. Create audit log
    await AuditLog.create({
        action: 'recognition_add',
        targetType: 'profile',
        targetId: profileId,
        performedBy: recogniserId,
        changes: { type, relationship, baseWeight },
        ipAddress,
        userAgent
    });

    return {
        entry,
        updatedRecognition: newRecognition
    };
}

/**
 * Get all recognitions for a profile with recogniser details
 */
async function getProfileRecognitions(profileId) {
    const recognitions = await RecognitionEntry.find({ profileId })
        .populate('recogniserId', 'name role')
        .sort({ createdAt: -1 });

    return recognitions.map(r => ({
        id: r._id,
        type: r.type,
        relationship: r.relationship,
        notes: r.notes,
        baseWeight: r.baseWeight,
        recogniser: {
            name: r.recogniserId?.name || 'Unknown',
            role: r.recogniserId?.role || 'unknown'
        },
        createdAt: r.createdAt
    }));
}

/**
 * Verify chain integrity for a profile's recognitions
 * Returns true if chain is intact, false if tampered
 */
async function verifyRecognitionChain(profileId) {
    const entries = await RecognitionEntry.find({ profileId }).sort({ createdAt: 1 });

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const expectedPrevHash = i === 0 ? null : entries[i - 1].entryHash;

        if (entry.previousEntryHash !== expectedPrevHash) {
            return { valid: false, brokenAt: i, entryId: entry._id };
        }
    }

    return { valid: true };
}

module.exports = {
    calculateRecognitionScore,
    addRecognition,
    getProfileRecognitions,
    verifyRecognitionChain
};
