const { Profile } = require('../models');

/**
 * Search profiles with filters
 */
async function searchProfiles(filters, pagination) {
    const { gender, ageMin, ageMax, caste, city, state, education, maritalStatus, recognitionLevel, sortBy } = filters;
    const { page, limit } = pagination;

    const query = { status: 'active' };

    // Gender filter
    if (gender) {
        query.gender = gender;
    }

    // Age filter (calculate date range from age)
    if (ageMin || ageMax) {
        query.dateOfBirth = {};
        const today = new Date();

        if (ageMax) {
            const minDate = new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate());
            query.dateOfBirth.$gte = minDate;
        }
        if (ageMin) {
            const maxDate = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
            query.dateOfBirth.$lte = maxDate;
        }
    }

    // Caste filter (case-insensitive partial match)
    if (caste) {
        query.caste = new RegExp(caste, 'i');
    }

    // City filter
    if (city) {
        query.city = new RegExp(city, 'i');
    }

    // State filter
    if (state) {
        query.state = new RegExp(state, 'i');
    }

    // Education filter
    if (education) {
        query.education = new RegExp(education, 'i');
    }

    // Marital status
    if (maritalStatus) {
        query.maritalStatus = maritalStatus;
    }

    // Recognition level
    if (recognitionLevel) {
        query['recognition.level'] = recognitionLevel;
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
        case 'recognition':
            sort = { 'recognition.score': -1 };
            break;
        case 'recent':
            sort = { createdAt: -1 };
            break;
        case 'oldest':
            sort = { createdAt: 1 };
            break;
        default:
            sort = { 'recognition.score': -1 };
    }

    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
        Profile.find(query)
            .select('fullName gender dateOfBirth caste city state education profession photos recognition fraudIndicators.phoneReused status')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Profile.countDocuments(query)
    ]);

    return {
        profiles: profiles.map(p => ({
            ...p.toObject(),
            primaryPhoto: p.photos?.find(ph => ph.isPrimary)?.url || p.photos?.[0]?.url || null
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

/**
 * Find matching profiles based on preferences
 */
async function findMatches(profileId) {
    const profile = await Profile.findById(profileId);
    if (!profile) {
        throw new Error('Profile not found');
    }

    const query = {
        _id: { $ne: profileId },
        status: 'active',
        gender: profile.gender === 'male' ? 'female' : 'male'
    };

    // Apply preferences if set
    if (profile.preferences) {
        const prefs = profile.preferences;

        if (prefs.ageMin || prefs.ageMax) {
            query.dateOfBirth = {};
            const today = new Date();

            if (prefs.ageMax) {
                query.dateOfBirth.$gte = new Date(today.getFullYear() - prefs.ageMax - 1, today.getMonth(), today.getDate());
            }
            if (prefs.ageMin) {
                query.dateOfBirth.$lte = new Date(today.getFullYear() - prefs.ageMin, today.getMonth(), today.getDate());
            }
        }

        if (prefs.caste && prefs.caste.length > 0) {
            query.caste = { $in: prefs.caste };
        }

        if (prefs.cities && prefs.cities.length > 0) {
            query.city = { $in: prefs.cities.map(c => new RegExp(c, 'i')) };
        }

        if (prefs.education && prefs.education.length > 0) {
            query.education = { $in: prefs.education.map(e => new RegExp(e, 'i')) };
        }

        if (prefs.maritalStatus && prefs.maritalStatus.length > 0) {
            query.maritalStatus = { $in: prefs.maritalStatus };
        }

        if (prefs.heightMin || prefs.heightMax) {
            query.heightCm = {};
            if (prefs.heightMin) query.heightCm.$gte = prefs.heightMin;
            if (prefs.heightMax) query.heightCm.$lte = prefs.heightMax;
        }
    }

    const matches = await Profile.find(query)
        .select('fullName gender dateOfBirth caste city education profession photos recognition')
        .sort({ 'recognition.score': -1 })
        .limit(20);

    return matches.map(p => ({
        ...p.toObject(),
        primaryPhoto: p.photos?.find(ph => ph.isPrimary)?.url || p.photos?.[0]?.url || null
    }));
}

module.exports = {
    searchProfiles,
    findMatches
};
