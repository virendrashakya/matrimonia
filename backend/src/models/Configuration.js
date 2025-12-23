const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
    // Singleton - only one config document
    _id: { type: String, default: 'app_config' },

    // App Branding
    appName: { type: String, default: 'Matrimonia' },
    appNameHi: { type: String, default: 'मैट्रिमोनिया' },
    tagline: { type: String, default: 'Where Families Connect' },
    taglineHi: { type: String, default: 'जहाँ परिवार मिलते हैं' },
    logoUrl: { type: String, default: '/logo.png' },

    // Theme
    primaryColor: { type: String, default: '#A0153E' },
    accentColor: { type: String, default: '#D4AF37' },

    // Feature Toggles
    enableRecognition: { type: Boolean, default: true },
    enableWhatsAppImport: { type: Boolean, default: true },
    maxPhotosPerProfile: { type: Number, default: 5 },

    // ========== DROPDOWN OPTIONS ==========

    // Rashi (Zodiac Signs)
    rashiOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Nakshatra (Star Constellations)
    nakshatraOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Indian States
    stateOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Religions
    religionOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Caste Categories (major castes, user can add their own)
    casteOptions: [String],

    // Mother Tongue / Languages
    languageOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Education Levels
    educationOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Professions
    professionOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Income Ranges
    incomeOptions: [String],

    // Complexion
    complexionOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Body Type
    bodyTypeOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Diet
    dietOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Marital Status
    maritalStatusOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Family Type
    familyTypeOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Manglik Status
    manglikOptions: [{
        value: String,
        labelEn: String,
        labelHi: String
    }],

    // Metadata
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
});

// Static method to get or create config
ConfigurationSchema.statics.getConfig = async function () {
    let config = await this.findById('app_config');
    if (!config) {
        config = await this.create({ _id: 'app_config', ...getDefaultOptions() });
    }
    return config;
};

// Default options
function getDefaultOptions() {
    return {
        rashiOptions: [
            { value: 'mesh', labelEn: 'Mesh (Aries)', labelHi: 'मेष' },
            { value: 'vrishabh', labelEn: 'Vrishabh (Taurus)', labelHi: 'वृषभ' },
            { value: 'mithun', labelEn: 'Mithun (Gemini)', labelHi: 'मिथुन' },
            { value: 'kark', labelEn: 'Kark (Cancer)', labelHi: 'कर्क' },
            { value: 'simha', labelEn: 'Simha (Leo)', labelHi: 'सिंह' },
            { value: 'kanya', labelEn: 'Kanya (Virgo)', labelHi: 'कन्या' },
            { value: 'tula', labelEn: 'Tula (Libra)', labelHi: 'तुला' },
            { value: 'vrishchik', labelEn: 'Vrishchik (Scorpio)', labelHi: 'वृश्चिक' },
            { value: 'dhanu', labelEn: 'Dhanu (Sagittarius)', labelHi: 'धनु' },
            { value: 'makar', labelEn: 'Makar (Capricorn)', labelHi: 'मकर' },
            { value: 'kumbh', labelEn: 'Kumbh (Aquarius)', labelHi: 'कुंभ' },
            { value: 'meen', labelEn: 'Meen (Pisces)', labelHi: 'मीन' },
        ],
        nakshatraOptions: [
            { value: 'ashwini', labelEn: 'Ashwini', labelHi: 'अश्विनी' },
            { value: 'bharani', labelEn: 'Bharani', labelHi: 'भरणी' },
            { value: 'krittika', labelEn: 'Krittika', labelHi: 'कृत्तिका' },
            { value: 'rohini', labelEn: 'Rohini', labelHi: 'रोहिणी' },
            { value: 'mrigashira', labelEn: 'Mrigashira', labelHi: 'मृगशिरा' },
            { value: 'ardra', labelEn: 'Ardra', labelHi: 'आर्द्रा' },
            { value: 'punarvasu', labelEn: 'Punarvasu', labelHi: 'पुनर्वसु' },
            { value: 'pushya', labelEn: 'Pushya', labelHi: 'पुष्य' },
            { value: 'ashlesha', labelEn: 'Ashlesha', labelHi: 'आश्लेषा' },
            { value: 'magha', labelEn: 'Magha', labelHi: 'मघा' },
            { value: 'purva_phalguni', labelEn: 'Purva Phalguni', labelHi: 'पूर्व फाल्गुनी' },
            { value: 'uttara_phalguni', labelEn: 'Uttara Phalguni', labelHi: 'उत्तर फाल्गुनी' },
            { value: 'hasta', labelEn: 'Hasta', labelHi: 'हस्त' },
            { value: 'chitra', labelEn: 'Chitra', labelHi: 'चित्रा' },
            { value: 'swati', labelEn: 'Swati', labelHi: 'स्वाति' },
            { value: 'vishakha', labelEn: 'Vishakha', labelHi: 'विशाखा' },
            { value: 'anuradha', labelEn: 'Anuradha', labelHi: 'अनुराधा' },
            { value: 'jyeshtha', labelEn: 'Jyeshtha', labelHi: 'ज्येष्ठा' },
            { value: 'mula', labelEn: 'Mula', labelHi: 'मूल' },
            { value: 'purva_ashadha', labelEn: 'Purva Ashadha', labelHi: 'पूर्वाषाढ़ा' },
            { value: 'uttara_ashadha', labelEn: 'Uttara Ashadha', labelHi: 'उत्तराषाढ़ा' },
            { value: 'shravana', labelEn: 'Shravana', labelHi: 'श्रवण' },
            { value: 'dhanishta', labelEn: 'Dhanishta', labelHi: 'धनिष्ठा' },
            { value: 'shatabhisha', labelEn: 'Shatabhisha', labelHi: 'शतभिषा' },
            { value: 'purva_bhadrapada', labelEn: 'Purva Bhadrapada', labelHi: 'पूर्व भाद्रपद' },
            { value: 'uttara_bhadrapada', labelEn: 'Uttara Bhadrapada', labelHi: 'उत्तर भाद्रपद' },
            { value: 'revati', labelEn: 'Revati', labelHi: 'रेवती' },
        ],
        stateOptions: [
            { value: 'andhra_pradesh', labelEn: 'Andhra Pradesh', labelHi: 'आंध्र प्रदेश' },
            { value: 'bihar', labelEn: 'Bihar', labelHi: 'बिहार' },
            { value: 'chhattisgarh', labelEn: 'Chhattisgarh', labelHi: 'छत्तीसगढ़' },
            { value: 'delhi', labelEn: 'Delhi', labelHi: 'दिल्ली' },
            { value: 'goa', labelEn: 'Goa', labelHi: 'गोवा' },
            { value: 'gujarat', labelEn: 'Gujarat', labelHi: 'गुजरात' },
            { value: 'haryana', labelEn: 'Haryana', labelHi: 'हरियाणा' },
            { value: 'himachal_pradesh', labelEn: 'Himachal Pradesh', labelHi: 'हिमाचल प्रदेश' },
            { value: 'jharkhand', labelEn: 'Jharkhand', labelHi: 'झारखंड' },
            { value: 'karnataka', labelEn: 'Karnataka', labelHi: 'कर्नाटक' },
            { value: 'kerala', labelEn: 'Kerala', labelHi: 'केरल' },
            { value: 'madhya_pradesh', labelEn: 'Madhya Pradesh', labelHi: 'मध्य प्रदेश' },
            { value: 'maharashtra', labelEn: 'Maharashtra', labelHi: 'महाराष्ट्र' },
            { value: 'odisha', labelEn: 'Odisha', labelHi: 'ओडिशा' },
            { value: 'punjab', labelEn: 'Punjab', labelHi: 'पंजाब' },
            { value: 'rajasthan', labelEn: 'Rajasthan', labelHi: 'राजस्थान' },
            { value: 'tamil_nadu', labelEn: 'Tamil Nadu', labelHi: 'तमिलनाडु' },
            { value: 'telangana', labelEn: 'Telangana', labelHi: 'तेलंगाना' },
            { value: 'uttar_pradesh', labelEn: 'Uttar Pradesh', labelHi: 'उत्तर प्रदेश' },
            { value: 'uttarakhand', labelEn: 'Uttarakhand', labelHi: 'उत्तराखंड' },
            { value: 'west_bengal', labelEn: 'West Bengal', labelHi: 'पश्चिम बंगाल' },
        ],
        religionOptions: [
            { value: 'hindu', labelEn: 'Hindu', labelHi: 'हिन्दू' },
            { value: 'muslim', labelEn: 'Muslim', labelHi: 'मुस्लिम' },
            { value: 'christian', labelEn: 'Christian', labelHi: 'ईसाई' },
            { value: 'sikh', labelEn: 'Sikh', labelHi: 'सिख' },
            { value: 'jain', labelEn: 'Jain', labelHi: 'जैन' },
            { value: 'buddhist', labelEn: 'Buddhist', labelHi: 'बौद्ध' },
        ],
        languageOptions: [
            { value: 'hindi', labelEn: 'Hindi', labelHi: 'हिंदी' },
            { value: 'english', labelEn: 'English', labelHi: 'अंग्रेज़ी' },
            { value: 'marathi', labelEn: 'Marathi', labelHi: 'मराठी' },
            { value: 'tamil', labelEn: 'Tamil', labelHi: 'तमिल' },
            { value: 'telugu', labelEn: 'Telugu', labelHi: 'तेलुगु' },
            { value: 'kannada', labelEn: 'Kannada', labelHi: 'कन्नड़' },
            { value: 'malayalam', labelEn: 'Malayalam', labelHi: 'मलयालम' },
            { value: 'bengali', labelEn: 'Bengali', labelHi: 'बंगाली' },
            { value: 'gujarati', labelEn: 'Gujarati', labelHi: 'गुजराती' },
            { value: 'punjabi', labelEn: 'Punjabi', labelHi: 'पंजाबी' },
            { value: 'bhojpuri', labelEn: 'Bhojpuri', labelHi: 'भोजपुरी' },
        ],
        educationOptions: [
            { value: 'high_school', labelEn: 'High School', labelHi: 'हाई स्कूल' },
            { value: 'intermediate', labelEn: 'Intermediate', labelHi: 'इंटरमीडिएट' },
            { value: 'graduate', labelEn: 'Graduate', labelHi: 'स्नातक' },
            { value: 'post_graduate', labelEn: 'Post Graduate', labelHi: 'परास्नातक' },
            { value: 'btech', labelEn: 'B.Tech/B.E.', labelHi: 'बी.टेक/बी.ई.' },
            { value: 'mba', labelEn: 'MBA', labelHi: 'एमबीए' },
            { value: 'mbbs', labelEn: 'MBBS/MD', labelHi: 'एमबीबीएस/एमडी' },
            { value: 'phd', labelEn: 'PhD/Doctorate', labelHi: 'पीएचडी' },
        ],
        professionOptions: [
            { value: 'software_engineer', labelEn: 'Software Engineer', labelHi: 'सॉफ्टवेयर इंजीनियर' },
            { value: 'doctor', labelEn: 'Doctor', labelHi: 'डॉक्टर' },
            { value: 'teacher', labelEn: 'Teacher/Professor', labelHi: 'शिक्षक/प्रोफेसर' },
            { value: 'government', labelEn: 'Government Job', labelHi: 'सरकारी नौकरी' },
            { value: 'business', labelEn: 'Business/Self-employed', labelHi: 'व्यापार' },
            { value: 'private_job', labelEn: 'Private Job', labelHi: 'प्राइवेट नौकरी' },
            { value: 'lawyer', labelEn: 'Lawyer', labelHi: 'वकील' },
            { value: 'engineer', labelEn: 'Engineer', labelHi: 'इंजीनियर' },
            { value: 'farmer', labelEn: 'Farmer', labelHi: 'किसान' },
            { value: 'homemaker', labelEn: 'Homemaker', labelHi: 'गृहिणी' },
        ],
        incomeOptions: [
            '0-3 LPA', '3-5 LPA', '5-7.5 LPA', '7.5-10 LPA',
            '10-15 LPA', '15-20 LPA', '20-30 LPA', '30-50 LPA', '50+ LPA'
        ],
        complexionOptions: [
            { value: 'very_fair', labelEn: 'Very Fair', labelHi: 'बहुत गोरा' },
            { value: 'fair', labelEn: 'Fair', labelHi: 'गोरा' },
            { value: 'wheatish', labelEn: 'Wheatish', labelHi: 'गेहुंआ' },
            { value: 'wheatish_brown', labelEn: 'Wheatish Brown', labelHi: 'गेहुंआ-भूरा' },
            { value: 'dark', labelEn: 'Dark', labelHi: 'सांवला' },
        ],
        bodyTypeOptions: [
            { value: 'slim', labelEn: 'Slim', labelHi: 'पतला' },
            { value: 'average', labelEn: 'Average', labelHi: 'सामान्य' },
            { value: 'athletic', labelEn: 'Athletic', labelHi: 'एथलेटिक' },
            { value: 'heavy', labelEn: 'Heavy', labelHi: 'भारी' },
        ],
        dietOptions: [
            { value: 'vegetarian', labelEn: 'Vegetarian', labelHi: 'शाकाहारी' },
            { value: 'non_vegetarian', labelEn: 'Non-Vegetarian', labelHi: 'मांसाहारी' },
            { value: 'eggetarian', labelEn: 'Eggetarian', labelHi: 'अंडाहारी' },
            { value: 'vegan', labelEn: 'Vegan', labelHi: 'वीगन' },
            { value: 'jain', labelEn: 'Jain', labelHi: 'जैन' },
        ],
        maritalStatusOptions: [
            { value: 'never_married', labelEn: 'Never Married', labelHi: 'अविवाहित' },
            { value: 'divorced', labelEn: 'Divorced', labelHi: 'तलाकशुदा' },
            { value: 'widowed', labelEn: 'Widowed', labelHi: 'विधवा/विधुर' },
            { value: 'awaiting_divorce', labelEn: 'Awaiting Divorce', labelHi: 'तलाक प्रक्रिया में' },
        ],
        familyTypeOptions: [
            { value: 'nuclear', labelEn: 'Nuclear', labelHi: 'एकल परिवार' },
            { value: 'joint', labelEn: 'Joint', labelHi: 'संयुक्त परिवार' },
        ],
        manglikOptions: [
            { value: 'manglik', labelEn: 'Manglik', labelHi: 'मांगलिक' },
            { value: 'non_manglik', labelEn: 'Non-Manglik', labelHi: 'अमांगलिक' },
            { value: 'anshik_manglik', labelEn: 'Anshik Manglik', labelHi: 'आंशिक मांगलिक' },
            { value: 'dont_know', labelEn: "Don't Know", labelHi: 'पता नहीं' },
        ],
        casteOptions: [
            'Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Rajput', 'Jat', 'Yadav',
            'Kurmi', 'Gupta', 'Agarwal', 'Baniya', 'Marwari', 'Patel', 'Sharma',
            'Verma', 'Singh', 'Thakur', 'Chauhan', 'Other'
        ]
    };
}

module.exports = mongoose.model('Configuration', ConfigurationSchema);
