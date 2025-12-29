const Joi = require('joi');

/**
 * User registration validation
 */
const registerSchema = Joi.object({
    name: Joi.string().required().trim().max(100),
    phone: Joi.string().required().pattern(/^\+?[\d\s-]{10,15}$/),
    email: Joi.string().email().optional(),
    password: Joi.string().required().min(6).max(100)
});

/**
 * User login validation
 */
const loginSchema = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required()
});

/**
 * Profile creation/update validation
 */
const profileSchema = Joi.object({
    // Basic Info
    fullName: Joi.string().required().trim().max(100),
    gender: Joi.string().valid('male', 'female').required(),
    dateOfBirth: Joi.date().required().max('now'),
    phone: Joi.string().required(),
    alternatePhone: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    maritalStatus: Joi.string().valid('never_married', 'divorced', 'widowed', 'awaiting_divorce').optional(),
    createdFor: Joi.string().valid('self', 'son', 'daughter', 'brother', 'sister', 'nephew', 'niece', 'friend', 'relative', 'client').optional(),

    // Location & Demographics
    caste: Joi.string().required(),
    subCaste: Joi.string().optional().allow(''),
    gotra: Joi.string().optional().allow(''),
    religion: Joi.string().optional().default('Hindu'),
    motherTongue: Joi.string().optional().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().optional().default('India'),
    nativePlace: Joi.string().optional().allow(''),

    // Education & Career
    education: Joi.string().required(),
    educationDetail: Joi.string().optional().allow(''),
    profession: Joi.string().required(),
    company: Joi.string().optional().allow(''),
    annualIncome: Joi.string().optional().allow(''),

    // Physical
    heightCm: Joi.number().optional().min(100).max(250).allow(null),
    weightKg: Joi.number().optional().min(30).max(200).allow(null),
    complexion: Joi.string().optional().allow(''),
    bodyType: Joi.string().optional().allow(''),

    // Lifestyle
    diet: Joi.string().optional().allow(''),
    smoking: Joi.string().optional().allow(''),
    drinking: Joi.string().optional().allow(''),
    hobbies: Joi.array().items(Joi.string()).optional(),
    languages: Joi.array().items(Joi.string()).optional(),
    aboutMe: Joi.string().optional().allow('').max(1000),

    // Family Details
    fatherName: Joi.string().optional().allow(''),
    fatherOccupation: Joi.string().optional().allow(''),
    fatherStatus: Joi.string().optional().allow(''),
    motherName: Joi.string().optional().allow(''),
    motherStatus: Joi.string().optional().allow(''),
    siblings: Joi.string().optional().allow(''),
    brothersCount: Joi.number().optional().min(0).max(10).allow(null),
    brothersMarried: Joi.number().optional().min(0).max(10).allow(null),
    sistersCount: Joi.number().optional().min(0).max(10).allow(null),
    sistersMarried: Joi.number().optional().min(0).max(10).allow(null),
    familyType: Joi.string().valid('joint', 'nuclear').optional().allow(''),
    familyStatus: Joi.string().optional().allow(''),
    familyValues: Joi.string().optional().allow(''),

    // Horoscope
    horoscope: Joi.object({
        rashi: Joi.string().optional().allow(''),
        nakshatra: Joi.string().optional().allow(''),
        manglikStatus: Joi.string().optional().allow(''),
        birthTime: Joi.string().optional().allow(''),
        birthPlace: Joi.string().optional().allow('')
    }).optional(),

    // Local content (Hindi)
    localContent: Joi.object().optional(),

    // Partner Preferences
    preferences: Joi.object({
        ageMin: Joi.number().optional().allow(null),
        ageMax: Joi.number().optional().allow(null),
        heightMin: Joi.number().optional().allow(null),
        heightMax: Joi.number().optional().allow(null),
        education: Joi.array().items(Joi.string()).optional(),
        caste: Joi.array().items(Joi.string()).optional(),
        cities: Joi.array().items(Joi.string()).optional(),
        state: Joi.array().items(Joi.string()).optional(),
        maritalStatus: Joi.array().items(Joi.string()).optional(),
        motherTongue: Joi.array().items(Joi.string()).optional(),
        diet: Joi.array().items(Joi.string()).optional(),
        smoking: Joi.array().items(Joi.string()).optional(),
        drinking: Joi.array().items(Joi.string()).optional(),
        manglikStatus: Joi.array().items(Joi.string()).optional(),
        rashiCompatibility: Joi.boolean().optional(),
        aboutPartner: Joi.string().optional().allow('').max(500)
    }).optional(),

    // Visibility control
    visibility: Joi.string().valid('public', 'restricted', 'private').optional()
});

/**
 * Recognition validation
 */
const recognitionSchema = Joi.object({
    type: Joi.string().valid('know_personally', 'know_family', 'verified_documents', 'community_reference').required(),
    relationship: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500)
});

/**
 * Search query validation
 */
const searchSchema = Joi.object({
    gender: Joi.string().valid('male', 'female').optional(),
    ageMin: Joi.number().min(18).max(100).optional(),
    ageMax: Joi.number().min(18).max(100).optional(),
    caste: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    education: Joi.string().optional(),
    maritalStatus: Joi.string().optional(),
    recognitionLevel: Joi.string().valid('new', 'low', 'moderate', 'high').optional(),
    sortBy: Joi.string().valid('recognition', 'recent', 'oldest').optional().default('recognition'),
    page: Joi.number().min(1).optional().default(1),
    limit: Joi.number().min(1).max(50).optional().default(20)
});

/**
 * Validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errors = error.details.map(d => d.message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        req.validatedBody = value;
        next();
    };
};

/**
 * Query validation middleware factory
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errors = error.details.map(d => d.message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        req.validatedQuery = value;
        next();
    };
};

module.exports = {
    validate,
    validateQuery,
    registerSchema,
    loginSchema,
    profileSchema,
    recognitionSchema,
    searchSchema
};
