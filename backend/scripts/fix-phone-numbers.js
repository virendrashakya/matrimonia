/**
 * Migration Script: Fix Phone Numbers to Indian Format (10 digits)
 * 
 * Run with: node scripts/fix-phone-numbers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const fixPhoneNumbers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Profile = require('../src/models/Profile');
        const User = require('../src/models/User');

        // Fix Profile phone numbers
        const profiles = await Profile.find({});
        let profilesFixed = 0;

        for (const profile of profiles) {
            let updated = false;

            if (profile.phone) {
                const cleanedPhone = cleanPhoneNumber(profile.phone);
                if (cleanedPhone !== profile.phone) {
                    profile.phone = cleanedPhone;
                    updated = true;
                }
            }

            if (profile.alternatePhone) {
                const cleanedAlt = cleanPhoneNumber(profile.alternatePhone);
                if (cleanedAlt !== profile.alternatePhone) {
                    profile.alternatePhone = cleanedAlt;
                    updated = true;
                }
            }

            if (updated) {
                await profile.save();
                profilesFixed++;
            }
        }

        console.log(`Fixed ${profilesFixed} profiles`);

        // Fix User phone numbers (bypass validators since some users have legacy data)
        const users = await User.find({});
        let usersFixed = 0;

        for (const user of users) {
            if (user.phone) {
                const cleanedPhone = cleanPhoneNumber(user.phone);
                if (cleanedPhone !== user.phone && cleanedPhone.match(/^[6-9]\d{9}$/)) {
                    // Only update if it's a valid Indian mobile format
                    await User.updateOne(
                        { _id: user._id },
                        { $set: { phone: cleanedPhone } }
                    );
                    usersFixed++;
                }
            }
        }

        console.log(`Fixed ${usersFixed} users`);
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

/**
 * Clean phone number to Indian format (10 digits)
 * - Removes country code (+91, 91, 0)
 * - Removes spaces, dashes, parentheses
 * - Pads or trims to 10 digits if necessary
 */
function cleanPhoneNumber(phone) {
    if (!phone) return phone;

    // Convert to string and remove all non-digits
    let cleaned = String(phone).replace(/\D/g, '');

    // Remove leading country codes
    if (cleaned.startsWith('91') && cleaned.length > 10) {
        cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = cleaned.substring(1);
    }

    // If still more than 10 digits, take last 10
    if (cleaned.length > 10) {
        cleaned = cleaned.slice(-10);
    }

    // If less than 10 digits, pad with 9s at the start (common mobile prefix)
    if (cleaned.length < 10) {
        cleaned = cleaned.padStart(10, '9');
    }

    return cleaned;
}

fixPhoneNumbers();
