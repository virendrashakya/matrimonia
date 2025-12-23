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

    // Physical
    heightCm: Number,
    complexion: String,

    // Marital
    maritalStatus: {
        type: String,
        enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
        default: 'never_married'
    },

    // Family
    fatherName: String,
    fatherOccupation: String,
    motherName: String,
    siblings: String, // "2 brothers, 1 sister"
    familyType: {
        type: String,
        enum: ['joint', 'nuclear']
    },
    familyStatus: String, // "Middle Class", "Upper Middle Class"

    // Preferences (what they're looking for)
    preferences: {
        ageMin: Number,
        ageMax: Number,
        heightMin: Number,
        heightMax: Number,
        education: [String],
        caste: [String],
        cities: [String],
        maritalStatus: [String]
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
