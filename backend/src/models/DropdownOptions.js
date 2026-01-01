const mongoose = require('mongoose');

/**
 * Dropdown Options Schema
 * Stores configurable dropdown options for profiles (castes, occupations, etc.)
 */
const DropdownOptionsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'dropdown_options'
    },
    castes: [{
        type: String,
        trim: true
    }],
    subCastes: [{
        type: String,
        trim: true
    }],
    occupations: [{
        type: String,
        trim: true
    }],
    educations: [{
        type: String,
        trim: true
    }],
    motherTongues: [{
        type: String,
        trim: true
    }],
    religions: [{
        type: String,
        trim: true
    }],
    maritalStatuses: [{
        type: String,
        trim: true
    }],
    diets: [{
        type: String,
        trim: true
    }],
    mangaliks: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    collection: 'dropdown_options'
});

// Initialize with default values if none exist
DropdownOptionsSchema.statics.getOrCreate = async function () {
    let options = await this.findById('dropdown_options');
    if (!options) {
        options = await this.create({
            _id: 'dropdown_options',
            castes: [
                'Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Rajput', 'Maratha',
                'Agarwal', 'Baniya', 'Jat', 'Gujjar', 'Patel', 'Khatri', 'Arora',
                'Yadav', 'Kurmi', 'Sharma', 'Verma', 'Other'
            ],
            occupations: [
                'Software Engineer', 'Doctor', 'CA/Finance', 'Teacher/Professor',
                'Business Owner', 'Government Employee', 'Lawyer', 'Engineer',
                'Manager', 'Consultant', 'Entrepreneur', 'Scientist', 'Banker',
                'Healthcare Professional', 'Artist/Designer', 'Other'
            ],
            educations: [
                'High School', '10+2', 'Diploma', 'Bachelor\'s', 'Master\'s',
                'PhD', 'MBBS', 'MD', 'B.Tech', 'M.Tech', 'MBA', 'CA', 'LLB',
                'B.Ed', 'B.Sc', 'M.Sc', 'BBA', 'BCA', 'MCA', 'Other'
            ],
            motherTongues: [
                'Hindi', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Tamil',
                'Telugu', 'Kannada', 'Malayalam', 'Odia', 'Assamese', 'Urdu',
                'Sanskrit', 'English', 'Other'
            ],
            religions: [
                'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'
            ],
            maritalStatuses: [
                'Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'
            ],
            diets: [
                'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain'
            ],
            mangaliks: [
                'Yes', 'No', 'Partial', 'Don\'t Know'
            ]
        });
    }
    return options;
};

module.exports = mongoose.model('DropdownOptions', DropdownOptionsSchema);
