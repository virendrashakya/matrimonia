const crypto = require('crypto');
const { Profile, AuditLog } = require('../models');

/**
 * Check if phone number is reused across profiles
 */
async function checkPhoneReuse(profileId, phone) {
    const existing = await Profile.find({
        phone: phone,
        _id: { $ne: profileId },
        status: { $ne: 'deleted' }
    }).select('_id fullName status');

    return {
        isReused: existing.length > 0,
        matchingProfiles: existing.map(p => ({
            id: p._id,
            name: p.fullName,
            status: p.status
        }))
    };
}

/**
 * Generate hash for biodata text (for duplicate detection)
 */
function generateBiodataHash(biodataText) {
    const normalized = biodataText.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Check if biodata text is duplicate
 */
async function checkBiodataDuplicate(profileId, biodataHash) {
    const existing = await Profile.find({
        'fraudIndicators.biodataHash': biodataHash,
        _id: { $ne: profileId },
        status: { $ne: 'deleted' }
    }).select('_id fullName');

    return {
        isDuplicate: existing.length > 0,
        matchingProfiles: existing.map(p => p._id)
    };
}

/**
 * Calculate profile completeness ratio
 */
function calculateProfileCompleteness(profile) {
    const importantFields = [
        'fullName', 'gender', 'dateOfBirth', 'phone', 'caste', 'city', 'state',
        'education', 'profession', 'fatherName', 'motherName', 'heightCm'
    ];

    let filled = 0;
    for (const field of importantFields) {
        if (profile[field]) filled++;
    }

    // Also check photos
    if (profile.photos && profile.photos.length > 0) filled++;

    return filled / (importantFields.length + 1);
}

/**
 * Compute fraud risk score (0-100)
 * Higher score = more suspicious
 */
async function computeFraudRisk(profileId) {
    const profile = await Profile.findById(profileId);
    if (!profile) return null;

    let riskScore = 0;
    const reasons = [];

    // Factor 1: No recognition from anyone
    if (profile.recognition.recogniserCount === 0) {
        riskScore += 20;
        reasons.push('No recognition from verified users');
    }

    // Factor 2: Low recognition score for old profile
    const ageInDays = (Date.now() - profile.firstSeenAt.getTime()) / (24 * 60 * 60 * 1000);
    if (ageInDays > 30 && profile.recognition.score < 5) {
        riskScore += 25;
        reasons.push('Low recognition despite being listed for 30+ days');
    }

    // Factor 3: Phone reuse
    if (profile.fraudIndicators.phoneReused) {
        riskScore += 30;
        reasons.push('Phone number used in another profile');
    }

    // Factor 4: Manual flags
    const flagCount = profile.fraudIndicators.flags?.length || 0;
    riskScore += Math.min(flagCount * 10, 30);
    if (flagCount > 0) {
        reasons.push(`${flagCount} manual flag(s) from users`);
    }

    // Factor 5: No photos
    if (!profile.photos || profile.photos.length === 0) {
        riskScore += 10;
        reasons.push('No photos uploaded');
    }

    // Factor 6: Incomplete profile
    const fillRatio = calculateProfileCompleteness(profile);
    if (fillRatio < 0.6) {
        riskScore += 15;
        reasons.push('Incomplete profile information');
    }

    return {
        score: Math.min(riskScore, 100),
        level: riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : 'high',
        reasons
    };
}

/**
 * Flag a profile for fraud/concerns
 */
async function flagProfile(profileId, flagType, reason, flaggedById, ipAddress, userAgent) {
    const profile = await Profile.findByIdAndUpdate(
        profileId,
        {
            $push: {
                'fraudIndicators.flags': {
                    flagType,
                    reason,
                    flaggedBy: flaggedById,
                    flaggedAt: new Date()
                }
            }
        },
        { new: true }
    );

    if (!profile) {
        throw new Error('Profile not found');
    }

    // Audit log
    await AuditLog.create({
        action: 'fraud_flag',
        targetType: 'profile',
        targetId: profileId,
        performedBy: flaggedById,
        changes: { flagType, reason },
        ipAddress,
        userAgent
    });

    return profile;
}

/**
 * Get all flagged profiles
 */
async function getFlaggedProfiles(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const profiles = await Profile.find({
        'fraudIndicators.flags.0': { $exists: true },
        status: { $ne: 'deleted' }
    })
        .select('fullName gender city caste recognition fraudIndicators status')
        .sort({ 'fraudIndicators.flags.flaggedAt': -1 })
        .skip(skip)
        .limit(limit);

    const total = await Profile.countDocuments({
        'fraudIndicators.flags.0': { $exists: true },
        status: { $ne: 'deleted' }
    });

    return {
        profiles,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

/**
 * Find potential duplicate profiles by phone
 */
async function findDuplicates() {
    const duplicates = await Profile.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$phone', count: { $sum: 1 }, profiles: { $push: { id: '$_id', name: '$fullName' } } } },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } }
    ]);

    return duplicates;
}

module.exports = {
    checkPhoneReuse,
    generateBiodataHash,
    checkBiodataDuplicate,
    computeFraudRisk,
    flagProfile,
    getFlaggedProfiles,
    findDuplicates,
    calculateProfileCompleteness
};
