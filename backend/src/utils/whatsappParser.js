/**
 * WhatsApp Chat Export Parser
 * 
 * Parses WhatsApp group chat exports (.txt files) to extract biodata information.
 * WhatsApp exports typically contain messages in format:
 * [DD/MM/YY, HH:MM:SS] Sender: Message
 * or
 * DD/MM/YYYY, HH:MM - Sender: Message
 * 
 * Biodata messages usually contain structured information like:
 * Name: John Doe
 * Age: 28
 * Caste: Brahmin
 * Education: B.Tech
 * etc.
 */

// Common patterns for extracting biodata fields
const FIELD_PATTERNS = {
    fullName: [
        /(?:name|naam)\s*[:\-]\s*(.+)/i,
        /(?:candidate|boy|girl)\s+name\s*[:\-]\s*(.+)/i
    ],
    gender: [
        /(?:gender|sex)\s*[:\-]\s*(male|female|m|f)/i,
        /\b(boy|girl|groom|bride)\b/i
    ],
    dateOfBirth: [
        /(?:dob|date\s*of\s*birth|birth\s*date)\s*[:\-]\s*(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/i,
        /(?:born|birthdate)\s*[:\-]\s*(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/i
    ],
    age: [
        /(?:age|umar)\s*[:\-]\s*(\d{2})\s*(?:years?|yrs?)?/i,
        /(\d{2})\s*(?:years?\s*old|yrs?\s*old)/i
    ],
    phone: [
        /(?:phone|mobile|contact|number|no\.?)\s*[:\-]\s*([\d\s\-\+]{10,15})/i,
        /(?:mob|cell)\s*[:\-]\s*([\d\s\-\+]{10,15})/i
    ],
    caste: [
        /(?:caste|jaati|jati)\s*[:\-]\s*(.+)/i,
        /(?:community|samaj)\s*[:\-]\s*(.+)/i
    ],
    subCaste: [
        /(?:sub[\-\s]?caste|gotra)\s*[:\-]\s*(.+)/i
    ],
    gotra: [
        /(?:gotra|gothra)\s*[:\-]\s*(.+)/i
    ],
    city: [
        /(?:city|place|location|residing)\s*[:\-]\s*(.+)/i,
        /(?:current\s*location)\s*[:\-]\s*(.+)/i
    ],
    state: [
        /(?:state|pradesh)\s*[:\-]\s*(.+)/i
    ],
    nativePlace: [
        /(?:native|hometown|original\s*place|belongs?\s*to)\s*[:\-]\s*(.+)/i
    ],
    education: [
        /(?:education|qualification|degree|study)\s*[:\-]\s*(.+)/i,
        /(?:educated|qualified)\s*[:\-]\s*(.+)/i
    ],
    profession: [
        /(?:profession|occupation|job|work|working)\s*[:\-]\s*(.+)/i,
        /(?:employed|working\s*as)\s*[:\-]\s*(.+)/i
    ],
    company: [
        /(?:company|employer|organisation|organization|firm)\s*[:\-]\s*(.+)/i
    ],
    annualIncome: [
        /(?:income|salary|earning|package)\s*[:\-]\s*(.+)/i,
        /(?:ctc|annual)\s*[:\-]\s*(.+)/i
    ],
    heightCm: [
        /(?:height)\s*[:\-]\s*(\d+)\s*(?:cm)?/i,
        /(?:height)\s*[:\-]\s*(\d+)['']\s*(\d+)[""]/i, // 5'8" format
    ],
    maritalStatus: [
        /(?:marital\s*status|married|unmarried|divorced|widow)/i
    ],
    fatherName: [
        /(?:father|papa|dad|pitaji)\s*(?:name|naam)?\s*[:\-]\s*(.+)/i,
        /(?:s\/o|d\/o|son\s*of|daughter\s*of)\s*(.+)/i
    ],
    fatherOccupation: [
        /(?:father'?s?\s*occupation|father\s*job|father\s*work)\s*[:\-]\s*(.+)/i
    ],
    motherName: [
        /(?:mother|mama|mom|mataji)\s*(?:name|naam)?\s*[:\-]\s*(.+)/i
    ],
    siblings: [
        /(?:siblings?|brothers?|sisters?)\s*[:\-]\s*(.+)/i
    ],
    familyType: [
        /(?:family\s*type)\s*[:\-]\s*(joint|nuclear)/i
    ]
};

/**
 * Parse a WhatsApp chat export file content
 * @param {string} content - Raw text content of the WhatsApp export
 * @returns {Array} Array of extracted biodata entries
 */
function parseWhatsAppExport(content) {
    // Split by message boundaries (WhatsApp format)
    const messagePattern = /(?:\[?\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\]?\s*[-–]\s*)/gi;

    const messages = content.split(messagePattern).filter(msg => msg.trim().length > 50);

    const biodataEntries = [];

    for (const message of messages) {
        // Check if message looks like biodata (has multiple field patterns)
        const matchCount = countBiodataPatterns(message);

        if (matchCount >= 3) { // At least 3 biodata fields found
            const biodata = extractBiodata(message);
            if (biodata.fullName || biodata.phone) {
                biodataEntries.push(biodata);
            }
        }
    }

    return biodataEntries;
}

/**
 * Count how many biodata patterns match in a message
 */
function countBiodataPatterns(text) {
    let count = 0;
    for (const patterns of Object.values(FIELD_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(text)) {
                count++;
                break; // Only count once per field
            }
        }
    }
    return count;
}

/**
 * Extract biodata fields from a message
 */
function extractBiodata(text) {
    const biodata = {};

    for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                let value = match[1]?.trim();

                // Special handling for certain fields
                if (field === 'gender') {
                    value = normalizeGender(match[0]);
                } else if (field === 'heightCm' && match[2]) {
                    // Convert feet/inches to cm
                    value = Math.round((parseInt(match[1]) * 30.48) + (parseInt(match[2]) * 2.54));
                } else if (field === 'maritalStatus') {
                    value = normalizeMaritalStatus(match[0]);
                } else if (field === 'dateOfBirth') {
                    value = parseDate(value);
                } else if (field === 'age' && !biodata.dateOfBirth) {
                    // Calculate approximate DOB from age
                    const age = parseInt(value);
                    if (age >= 18 && age <= 100) {
                        const year = new Date().getFullYear() - age;
                        value = null; // Don't set age directly
                        biodata.dateOfBirth = new Date(year, 0, 1);
                    }
                } else if (field === 'phone') {
                    value = value?.replace(/[\s\-]/g, '');
                }

                if (value && field !== 'age') {
                    biodata[field] = value;
                }
                break;
            }
        }
    }

    // Store original text for reference
    biodata._rawText = text.substring(0, 500);

    return biodata;
}

/**
 * Normalize gender values
 */
function normalizeGender(text) {
    const lower = text.toLowerCase();
    if (lower.includes('female') || lower.includes('girl') || lower.includes('bride') || lower === 'f') {
        return 'female';
    }
    return 'male';
}

/**
 * Normalize marital status
 */
function normalizeMaritalStatus(text) {
    const lower = text.toLowerCase();
    if (lower.includes('divorced') || lower.includes('divorcee')) return 'divorced';
    if (lower.includes('widow')) return 'widowed';
    if (lower.includes('married') && !lower.includes('unmarried')) return 'divorced';
    return 'never_married';
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    // Try common formats
    const formats = [
        /(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/,  // DD/MM/YYYY
        /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})/,   // DD/MM/YY
    ];

    for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
            let [_, day, month, year] = match;
            if (year.length === 2) {
                year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
            }
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
    }

    return null;
}

/**
 * Validate and clean extracted biodata for database insertion
 */
function validateBiodata(biodata, defaultUserId) {
    const cleaned = {
        createdBy: defaultUserId
    };

    // Required fields with defaults
    cleaned.fullName = biodata.fullName || 'Unknown';
    cleaned.gender = biodata.gender || 'male';
    cleaned.dateOfBirth = biodata.dateOfBirth || new Date(1995, 0, 1);
    cleaned.phone = biodata.phone || `IMPORT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    cleaned.caste = biodata.caste || 'Not specified';
    cleaned.city = biodata.city || 'Not specified';
    cleaned.state = biodata.state || 'Not specified';
    cleaned.education = biodata.education || 'Not specified';
    cleaned.profession = biodata.profession || 'Not specified';

    // Optional fields
    if (biodata.subCaste) cleaned.subCaste = biodata.subCaste;
    if (biodata.gotra) cleaned.gotra = biodata.gotra;
    if (biodata.nativePlace) cleaned.nativePlace = biodata.nativePlace;
    if (biodata.company) cleaned.company = biodata.company;
    if (biodata.annualIncome) cleaned.annualIncome = biodata.annualIncome;
    if (biodata.heightCm) cleaned.heightCm = parseInt(biodata.heightCm);
    if (biodata.maritalStatus) cleaned.maritalStatus = biodata.maritalStatus;
    if (biodata.fatherName) cleaned.fatherName = biodata.fatherName;
    if (biodata.fatherOccupation) cleaned.fatherOccupation = biodata.fatherOccupation;
    if (biodata.motherName) cleaned.motherName = biodata.motherName;
    if (biodata.siblings) cleaned.siblings = biodata.siblings;
    if (biodata.familyType) cleaned.familyType = biodata.familyType;

    // Store original text for manual review
    if (biodata._rawText) {
        cleaned._importedFrom = 'whatsapp';
        cleaned._rawText = biodata._rawText;
    }

    return cleaned;
}

module.exports = {
    parseWhatsAppExport,
    extractBiodata,
    validateBiodata
};
