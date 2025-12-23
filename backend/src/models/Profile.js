const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    // Basic Info
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxLength: 100
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Gender is required']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },

    // Contact
    phone: {
        type: String,
        required: [true, 'Phone is required']
    },
    alternatePhone: String,
    email: {
        type: String,
        lowercase: true
    },

    // Demographics
    caste: {
        type: String,
        required: [true, 'Caste is required'],
        index: true
    },
    subCaste: String,
    gotra: String,
    religion: {
        type: String,
        default: 'Hindu'
    },
    motherTongue: String,

    // Location
    city: {
        type: String,
        required: [true, 'City is required'],
        index: true
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    country: {
        type: String,
        default: 'India'
    },
    nativePlace: String,

    // Education & Profession
    education: {
        type: String,
        required: [true, 'Education is required']
    },
    educationDetail: String,
    profession: {
        type: String,
        required: [true, 'Profession is required']
    },
    company: String,
    annualIncome: String, // Range like "5-10 LPA"

    // Local Language Content (Hindi)
    localContent: {
        fullName: String,      // पूरा नाम
        caste: String,         // जाति
        subCaste: String,      // उपजाति
        gotra: String,         // गोत्र
        city: String,          // शहर
        state: String,         // राज्य
        nativePlace: String,   // मूल स्थान
        education: String,     // शिक्षा
        educationDetail: String,
        profession: String,    // पेशा
        company: String,       // कंपनी
        fatherName: String,    // पिता का नाम
        fatherOccupation: String,
        motherName: String,    // माता का नाम
        siblings: String,      // भाई-बहन
        aboutMe: String,       // मेरे बारे में
    },

    // Physical Attributes
    heightCm: Number,
    weightKg: Number,
    complexion: {
        type: String,
        enum: ['very_fair', 'fair', 'wheatish', 'wheatish_brown', 'dark']
    },
    bodyType: {
        type: String,
        enum: ['slim', 'average', 'athletic', 'heavy']
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
    },
    physicalStatus: {
        type: String,
        enum: ['normal', 'physically_challenged'],
        default: 'normal'
    },

    // Horoscope / Kundli Details
    horoscope: {
        rashi: {
            type: String,
            enum: ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya',
                'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen']
        },
        nakshatra: {
            type: String,
            enum: ['ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira', 'ardra',
                'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva_phalguni', 'uttara_phalguni',
                'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha',
                'mula', 'purva_ashadha', 'uttara_ashadha', 'shravana', 'dhanishta', 'shatabhisha',
                'purva_bhadrapada', 'uttara_bhadrapada', 'revati']
        },
        manglikStatus: {
            type: String,
            enum: ['manglik', 'non_manglik', 'anshik_manglik', 'dont_know'],
            default: 'dont_know'
        },
        birthTime: String,
        birthPlace: String,
    },

    // Lifestyle
    diet: {
        type: String,
        enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain'],
        default: 'vegetarian'
    },
    smoking: {
        type: String,
        enum: ['no', 'occasionally', 'yes'],
        default: 'no'
    },
    drinking: {
        type: String,
        enum: ['no', 'occasionally', 'yes'],
        default: 'no'
    },

    // About Me
    aboutMe: {
        type: String,
        maxLength: 1000
    },
    hobbies: [String],
    languages: [String], // Languages known

    // Marital
    maritalStatus: {
        type: String,
        enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce', 'annulled'],
        default: 'never_married'
    },
    numberOfChildren: {
        type: Number,
        default: 0
    },
    childrenLivingWith: {
        type: String,
        enum: ['not_applicable', 'living_together', 'not_living_together']
    },

    // Family Details
    fatherName: String,
    fatherOccupation: String,
    fatherStatus: {
        type: String,
        enum: ['employed', 'business', 'retired', 'not_employed', 'passed_away']
    },
    motherName: String,
    motherOccupation: String,
    motherStatus: {
        type: String,
        enum: ['homemaker', 'employed', 'business', 'retired', 'passed_away']
    },
    siblings: String,
    brothersCount: Number,
    sistersCount: Number,
    brothersMarried: Number,
    sistersMarried: Number,
    familyType: {
        type: String,
        enum: ['joint', 'nuclear', 'other']
    },
    familyStatus: {
        type: String,
        enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent', 'lower_middle_class']
    },
    familyValues: {
        type: String,
        enum: ['traditional', 'moderate', 'liberal']
    },
    familyIncome: String,
    propertyDetails: String,

    // Partner Preferences (comprehensive)
    preferences: {
        // Age & Physical
        ageMin: { type: Number, min: 18, max: 70 },
        ageMax: { type: Number, min: 18, max: 70 },
        heightMin: Number,
        heightMax: Number,
        weightMin: Number,
        weightMax: Number,
        bodyType: [{ type: String, enum: ['slim', 'average', 'athletic', 'heavy'] }],
        complexion: [{ type: String, enum: ['very_fair', 'fair', 'wheatish', 'wheatish_brown', 'dark', 'any'] }],
        physicalStatus: { type: String, enum: ['normal', 'doesnt_matter'], default: 'normal' },

        // Background
        maritalStatus: [{ type: String, enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce', 'annulled', 'any'] }],
        religion: [String],
        caste: [String],
        subCaste: [String],
        gotras: [String], // Gotras to exclude (same gotra marriage avoided)
        motherTongue: [String],

        // Location
        country: [String],
        state: [String],
        city: [String],
        residencyStatus: [{ type: String, enum: ['citizen', 'permanent_resident', 'work_permit', 'student_visa', 'any'] }],

        // Education & Career
        education: [String],
        educationLevel: [{ type: String, enum: ['high_school', 'diploma', 'bachelors', 'masters', 'doctorate', 'any'] }],
        profession: [String],
        workingWith: [{ type: String, enum: ['private_company', 'government', 'business', 'self_employed', 'not_working', 'any'] }],
        incomeMin: String,
        incomeMax: String,

        // Lifestyle
        diet: [{ type: String, enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'any'] }],
        smoking: [{ type: String, enum: ['no', 'occasionally', 'yes', 'any'] }],
        drinking: [{ type: String, enum: ['no', 'occasionally', 'yes', 'any'] }],

        // Horoscope
        manglikStatus: [{ type: String, enum: ['manglik', 'non_manglik', 'anshik_manglik', 'any'] }],
        rashiCompatibility: Boolean,

        // Family
        familyType: [{ type: String, enum: ['joint', 'nuclear', 'any'] }],
        familyValues: [{ type: String, enum: ['traditional', 'moderate', 'liberal', 'any'] }],
        familyStatus: [{ type: String, enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent', 'any'] }],

        // Other Preferences
        aboutPartner: { type: String, maxLength: 500 }, // Free text description
    },

    // Media
    photos: [{
        url: { type: String, required: true },
        publicId: String, // Cloudinary ID
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
    }],
    biodataFile: {
        url: String,
        publicId: String,
        uploadedAt: Date
    },

    // Recognition (denormalized for fast access)
    recognition: {
        score: { type: Number, default: 0, index: true },
        level: {
            type: String,
            enum: ['new', 'low', 'moderate', 'high'],
            default: 'new'
        },
        recogniserCount: { type: Number, default: 0 },
        lastRecognitionAt: Date
    },

    // Fraud Indicators
    fraudIndicators: {
        phoneReused: { type: Boolean, default: false },
        biodataHash: String, // For duplicate detection
        photoHashes: [String],
        flags: [{
            flagType: String,
            reason: String,
            flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            flaggedAt: { type: Date, default: Date.now }
        }]
    },

    // Lifecycle
    status: {
        type: String,
        enum: ['active', 'matched', 'withdrawn', 'deleted'],
        default: 'active',
        index: true
    },

    // Tracking
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    timesReferred: { type: Number, default: 0 },

    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });

// Compound indexes for efficient search
ProfileSchema.index({ gender: 1, status: 1, 'recognition.score': -1 });
ProfileSchema.index({ caste: 1, city: 1, status: 1 });
ProfileSchema.index({ 'fraudIndicators.biodataHash': 1 });
ProfileSchema.index({ phone: 1 });

// Virtual for age calculation
ProfileSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
});

// Include virtuals in JSON
ProfileSchema.set('toJSON', { virtuals: true });
ProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Profile', ProfileSchema);
