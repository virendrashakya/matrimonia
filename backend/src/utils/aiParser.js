const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY');

/**
 * Clean JSON string if LLM returns markdown formatting
 */
const cleanJson = (text) => {
    if (!text) return '';

    // Remove code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');

    // Trim
    cleaned = cleaned.trim();

    return cleaned;
};

/**
 * Parse raw biodata text into structured object using Gemini
 * @param {string} rawText The raw text extracted from PDF or Image
 * @returns {Promise<Object>} Structured profile object
 */
const parseBiodataWithAI = async (rawText) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are an expert Indian Matrimonial Data Parser. 
        Your task is to extract structured data from the following raw biodata text.
        
        Return ONLY a valid JSON object. Do not include markdown formatting or explanations.
        
        Fields to extract:
        - fullName (string)
        - gender (string: "male" or "female" - infer from context)
        - dateOfBirth (string: YYYY-MM-DD - estimate year if only age given, assume current year ${new Date().getFullYear()})
        - age (number)
        - heightCm (number - convert from feet/inches e.g. 5'5" -> 165)
        - weightKg (number)
        - maritalStatus (string: "never_married", "divorced", "widowed", "awaiting_divorce")
        - religion (string)
        - caste (string)
        - subCaste (string)
        - gotra (string)
        - motherTongue (string)
        - education (string - highest degree)
        - profession (string - job title)
        - company (string)
        - annualIncome (string)
        - city (string)
        - state (string)
        - phone (string - extract primary mobile number)
        - email (string)
        - fatherName (string)
        - fatherOccupation (string)
        - motherName (string)
        - motherOccupation (string)
        
        Raw Text:
        ${rawText.substring(0, 10000)} // Safety limit
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = cleanJson(text);
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('AI Parsing Error:', error);
        throw new Error('Failed to parse biodata with AI: ' + error.message);
    }
};

module.exports = { parseBiodataWithAI };
