/**
 * Recognition weight configuration
 * Core values for the fraud-resistant recognition system
 */
const RECOGNITION_WEIGHTS = {
    // Weight by user role
    roles: {
        admin: 10,
        moderator: 8,
        matchmaker: 6, // Matchmakers have medium-high weight
        elder: 8,
        helper: 5,
        contributor: 2
    },

    // Multiplier by recognition type
    types: {
        know_personally: 1.5,
        know_family: 1.3,
        verified_documents: 1.2,
        community_reference: 1.0
    },

    // Score thresholds for recognition levels
    levels: {
        new: { min: 0, max: 5 },
        low: { min: 5, max: 20 },
        moderate: { min: 20, max: 50 },
        high: { min: 50, max: Infinity }
    },

    // Decay configuration (score reduces over time without new recognition)
    decay: {
        halfLifeWeeks: 52, // Score halves every year
        minWeight: 0.1     // Never decay below 10% of original weight
    }
};

/**
 * Determine recognition level from score
 */
function getRecognitionLevel(score) {
    for (const [level, range] of Object.entries(RECOGNITION_WEIGHTS.levels)) {
        if (score >= range.min && score < range.max) {
            return level;
        }
    }
    return 'new';
}

module.exports = { RECOGNITION_WEIGHTS, getRecognitionLevel };
