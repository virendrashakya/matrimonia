/**
 * WhatsApp sharing utilities for matrimonial profiles
 */

const WHATSAPP_BASE_URL = 'https://wa.me/';

/**
 * Format profile for WhatsApp sharing
 */
export function formatProfileForWhatsApp(profile, language = 'en') {
    const age = profile.dateOfBirth
        ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : '';

    const profileUrl = `${window.location.origin}/profiles/${profile._id}`;

    if (language === 'hi') {
        return `🙏 *विवाह प्रस्ताव*

👤 *${profile.fullName}*
${profile.gender === 'male' ? '👨 पुरुष' : '👩 महिला'}${age ? `, ${age} वर्ष` : ''}

📍 ${profile.city || ''}, ${profile.state || ''}
🎓 ${profile.education || ''}
💼 ${profile.profession || ''}
🏠 ${profile.caste || ''}

💰 आय: ${profile.annualIncome || 'जानकारी नहीं'}
📏 ऊंचाई: ${profile.heightCm ? `${profile.heightCm} cm` : 'जानकारी नहीं'}

🔗 पूरी प्रोफ़ाइल देखें:
${profileUrl}

📱 *पहचान* ऐप से साझा किया गया`;
    }

    return `🙏 *Marriage Proposal*

👤 *${profile.fullName}*
${profile.gender === 'male' ? '👨 Male' : '👩 Female'}${age ? `, ${age} years` : ''}

📍 ${profile.city || ''}, ${profile.state || ''}
🎓 ${profile.education || ''}
💼 ${profile.profession || ''}
🏠 ${profile.caste || ''}

💰 Income: ${profile.annualIncome || 'Not disclosed'}
📏 Height: ${profile.heightCm ? `${profile.heightCm} cm` : 'Not disclosed'}

🔗 View Full Profile:
${profileUrl}

📱 Shared via *Pehchan* App`;
}

/**
 * Share profile via WhatsApp
 */
export function shareViaWhatsApp(profile, language = 'en', phoneNumber = '') {
    const message = formatProfileForWhatsApp(profile, language);
    const encodedMessage = encodeURIComponent(message);

    let url;
    if (phoneNumber) {
        // Direct share to specific number
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        url = `${WHATSAPP_BASE_URL}${cleanNumber}?text=${encodedMessage}`;
    } else {
        // Share via WhatsApp chooser
        url = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    }

    window.open(url, '_blank');
}

/**
 * Share multiple profiles for comparison
 */
export function shareMultipleProfiles(profiles, language = 'en') {
    const header = language === 'hi'
        ? `🙏 *${profiles.length} विवाह प्रस्ताव*\n\n`
        : `🙏 *${profiles.length} Marriage Proposals*\n\n`;

    const profileSummaries = profiles.map((profile, idx) => {
        const age = profile.dateOfBirth
            ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
            : '';

        if (language === 'hi') {
            return `*${idx + 1}. ${profile.fullName}*
${age} वर्ष | ${profile.city} | ${profile.education}
🔗 ${window.location.origin}/profiles/${profile._id}`;
        }

        return `*${idx + 1}. ${profile.fullName}*
${age} yrs | ${profile.city} | ${profile.education}
🔗 ${window.location.origin}/profiles/${profile._id}`;
    }).join('\n\n');

    const footer = language === 'hi'
        ? '\n\n📱 *पहचान* ऐप से साझा किया गया'
        : '\n\n📱 Shared via *Pehchan* App';

    const message = header + profileSummaries + footer;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

export default {
    formatProfileForWhatsApp,
    shareViaWhatsApp,
    shareMultipleProfiles
};
