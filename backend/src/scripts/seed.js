/**
 * Database Seed Script
 * Creates test users with all available roles and sample matrimonial profiles
 * 
 * Run: node src/scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Profile, Recognition, Configuration } = require('../models');

const USERS = [
    {
        name: 'Admin User',
        phone: '9999999901',
        password: 'admin123',
        role: 'admin',
        isVerified: true
    },
    {
        name: 'Moderator User',
        phone: '9999999902',
        password: 'mod123',
        role: 'moderator',
        isVerified: true
    },
    {
        name: 'Matchmaker Agency',
        phone: '9999999903',
        password: 'match123',
        role: 'matchmaker',
        isVerified: true,
        agency: {
            name: 'शुभ विवाह मैचमेकर्स',
            city: 'Jaipur',
            state: 'Rajasthan',
            establishedYear: 2010,
            description: 'Premium matchmaking services for all communities'
        }
    },
    {
        name: 'Elder Uncle',
        phone: '9999999904',
        password: 'elder123',
        role: 'elder',
        isVerified: true
    },
    {
        name: 'Helper Friend',
        phone: '9999999905',
        password: 'helper123',
        role: 'helper',
        isVerified: true
    },
    {
        name: 'Regular Contributor',
        phone: '9999999906',
        password: 'user123',
        role: 'contributor',
        isVerified: true
    },
    {
        name: 'Unverified User',
        phone: '9999999907',
        password: 'unverified123',
        role: 'contributor',
        isVerified: false
    }
];

// Generate unique phone numbers for profiles
let phoneCounter = 8800000001;
const getPhone = () => String(phoneCounter++);

// Sample profile data with correct enum values
const SAMPLE_PROFILES = [
    // Male profiles
    {
        fullName: 'Rahul Sharma',
        gender: 'male',
        dateOfBirth: new Date('1995-03-15'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Brahmin',
        city: 'Delhi',
        state: 'Delhi',
        education: 'B.Tech',
        educationDetail: 'IIT Delhi - Computer Science',
        profession: 'Software Engineer',
        company: 'Google India',
        annualIncome: '25-35 LPA',
        heightCm: 175,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'mesh', nakshatra: 'ashwini' },
        aboutMe: 'Passionate about technology and innovation. Love traveling and music.',
        status: 'active'
    },
    {
        fullName: 'Amit Verma',
        gender: 'male',
        dateOfBirth: new Date('1993-07-22'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Agarwal',
        city: 'Mumbai',
        state: 'Maharashtra',
        education: 'MBA',
        educationDetail: 'IIM Ahmedabad',
        profession: 'Business Analyst',
        company: 'McKinsey',
        annualIncome: '30-40 LPA',
        heightCm: 178,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'simha', nakshatra: 'magha' },
        aboutMe: 'Family-oriented professional seeking a life partner who values tradition.',
        status: 'active'
    },
    {
        fullName: 'Vikram Singh',
        gender: 'male',
        dateOfBirth: new Date('1990-11-05'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Rajput',
        city: 'Jaipur',
        state: 'Rajasthan',
        education: 'MBBS',
        educationDetail: 'AIIMS Delhi',
        profession: 'Doctor',
        company: 'Apollo Hospitals',
        annualIncome: '20-30 LPA',
        heightCm: 180,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'dhanu', nakshatra: 'mula' },
        aboutMe: 'Dedicated doctor serving communities. Looking for an understanding partner.',
        status: 'active'
    },
    {
        fullName: 'Arjun Patel',
        gender: 'male',
        dateOfBirth: new Date('1992-02-18'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Patel',
        city: 'Ahmedabad',
        state: 'Gujarat',
        education: 'B.Com',
        educationDetail: 'Gujarat University',
        profession: 'Business Owner',
        company: 'Family Business - Textiles',
        annualIncome: '50-75 LPA',
        heightCm: 172,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'vrishabh', nakshatra: 'rohini' },
        aboutMe: 'Running family textile business. Traditional values with modern outlook.',
        status: 'active'
    },
    {
        fullName: 'Sanjay Gupta',
        gender: 'male',
        dateOfBirth: new Date('1988-09-12'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Gupta',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        education: 'CA',
        profession: 'Chartered Accountant',
        company: 'Deloitte',
        annualIncome: '18-25 LPA',
        heightCm: 168,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'kanya', nakshatra: 'hasta' },
        aboutMe: 'Finance professional with stable career. Family-oriented with simple lifestyle.',
        status: 'active'
    },
    {
        fullName: 'Mohammed Aziz',
        gender: 'male',
        dateOfBirth: new Date('1994-04-25'),
        phone: getPhone(),
        religion: 'Muslim',
        caste: 'Syed',
        city: 'Hyderabad',
        state: 'Telangana',
        education: 'M.Tech',
        profession: 'Data Scientist',
        company: 'Microsoft',
        annualIncome: '28-35 LPA',
        heightCm: 176,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        aboutMe: 'Tech enthusiast working in AI/ML. Looking for educated, progressive partner.',
        status: 'active'
    },
    {
        fullName: 'Gurpreet Singh',
        gender: 'male',
        dateOfBirth: new Date('1991-06-30'),
        phone: getPhone(),
        religion: 'Sikh',
        caste: 'Jat Sikh',
        city: 'Chandigarh',
        state: 'Punjab',
        education: 'B.Tech',
        profession: 'Civil Engineer',
        company: 'L&T',
        annualIncome: '15-20 LPA',
        heightCm: 183,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'mithun', nakshatra: 'ardra' },
        aboutMe: 'Simple Punjabi family, love sports and outdoor activities.',
        status: 'active'
    },
    {
        fullName: 'Ravi Kumar',
        gender: 'male',
        dateOfBirth: new Date('1989-12-08'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Yadav',
        city: 'Patna',
        state: 'Bihar',
        education: 'IAS',
        profession: 'IAS Officer',
        company: 'Government of India',
        annualIncome: '15-20 LPA',
        heightCm: 170,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'makar', nakshatra: 'shravana' },
        aboutMe: 'Civil servant dedicated to public service. Value honesty and simplicity.',
        status: 'active'
    },
    {
        fullName: 'Joseph Thomas',
        gender: 'male',
        dateOfBirth: new Date('1993-01-14'),
        phone: getPhone(),
        religion: 'Christian',
        caste: 'Syrian Christian',
        city: 'Kochi',
        state: 'Kerala',
        education: 'MBA',
        profession: 'Marketing Manager',
        company: 'Hindustan Unilever',
        annualIncome: '22-28 LPA',
        heightCm: 174,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        aboutMe: 'Marketing professional with creative mindset. Love music and traveling.',
        status: 'active'
    },
    {
        fullName: 'Aditya Reddy',
        gender: 'male',
        dateOfBirth: new Date('1996-08-20'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Reddy',
        city: 'Bangalore',
        state: 'Karnataka',
        education: 'B.Tech',
        profession: 'Product Manager',
        company: 'Amazon',
        annualIncome: '35-45 LPA',
        heightCm: 177,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'tula', nakshatra: 'swati' },
        aboutMe: 'Product enthusiast at heart. Seeking partner who shares ambitious goals.',
        status: 'active'
    },
    {
        fullName: 'Deepak Joshi',
        gender: 'male',
        dateOfBirth: new Date('1987-05-11'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Brahmin',
        city: 'Pune',
        state: 'Maharashtra',
        education: 'PhD',
        profession: 'Research Scientist',
        company: 'ISRO',
        annualIncome: '18-22 LPA',
        heightCm: 169,
        complexion: 'fair',
        maritalStatus: 'divorced',
        horoscope: { rashi: 'kumbh', nakshatra: 'shatabhisha' },
        aboutMe: 'Scientist working on space research. Looking for second chance at happiness.',
        status: 'active'
    },
    // Female profiles
    {
        fullName: 'Priya Sharma',
        gender: 'female',
        dateOfBirth: new Date('1996-05-20'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Brahmin',
        city: 'Bangalore',
        state: 'Karnataka',
        education: 'M.Tech',
        educationDetail: 'IISc Bangalore',
        profession: 'Software Engineer',
        company: 'Microsoft',
        annualIncome: '22-30 LPA',
        heightCm: 165,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'mithun', nakshatra: 'mrigashira' },
        aboutMe: 'Tech professional with traditional values. Love cooking and reading.',
        status: 'active'
    },
    {
        fullName: 'Neha Agarwal',
        gender: 'female',
        dateOfBirth: new Date('1994-09-10'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Agarwal',
        city: 'Kolkata',
        state: 'West Bengal',
        education: 'MBA',
        profession: 'HR Manager',
        company: 'TCS',
        annualIncome: '15-20 LPA',
        heightCm: 160,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'kanya', nakshatra: 'uttara_phalguni' },
        aboutMe: 'People-focused professional. Value family bonds and cultural traditions.',
        status: 'active'
    },
    {
        fullName: 'Ananya Singh',
        gender: 'female',
        dateOfBirth: new Date('1997-12-03'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Rajput',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        education: 'MBBS',
        profession: 'Doctor',
        company: 'KGMU Hospital',
        annualIncome: '12-18 LPA',
        heightCm: 162,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'dhanu', nakshatra: 'purva_ashadha' },
        aboutMe: 'Young doctor passionate about healthcare. Looking for supportive partner.',
        status: 'active'
    },
    {
        fullName: 'Kavita Patel',
        gender: 'female',
        dateOfBirth: new Date('1993-03-28'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Patel',
        city: 'Surat',
        state: 'Gujarat',
        education: 'B.Pharm',
        profession: 'Pharmacist',
        company: 'Cipla',
        annualIncome: '8-12 LPA',
        heightCm: 158,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'mesh', nakshatra: 'bharani' },
        aboutMe: 'Simple Gujarati girl from business family. Love cooking and art.',
        status: 'active'
    },
    {
        fullName: 'Sneha Iyer',
        gender: 'female',
        dateOfBirth: new Date('1995-07-17'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Iyer',
        city: 'Chennai',
        state: 'Tamil Nadu',
        education: 'CA',
        profession: 'Chartered Accountant',
        company: 'EY',
        annualIncome: '18-25 LPA',
        heightCm: 163,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'kark', nakshatra: 'pushya' },
        aboutMe: 'Finance professional who loves classical music and dance.',
        status: 'active'
    },
    {
        fullName: 'Fatima Khan',
        gender: 'female',
        dateOfBirth: new Date('1996-02-14'),
        phone: getPhone(),
        religion: 'Muslim',
        caste: 'Khan',
        city: 'Delhi',
        state: 'Delhi',
        education: 'B.Arch',
        profession: 'Architect',
        company: 'Self Employed',
        annualIncome: '12-18 LPA',
        heightCm: 167,
        complexion: 'fair',
        maritalStatus: 'never_married',
        aboutMe: 'Creative architect with passion for sustainable design. Religious and modern.',
        status: 'active'
    },
    {
        fullName: 'Harpreet Kaur',
        gender: 'female',
        dateOfBirth: new Date('1994-10-05'),
        phone: getPhone(),
        religion: 'Sikh',
        caste: 'Khatri',
        city: 'Amritsar',
        state: 'Punjab',
        education: 'MBA',
        profession: 'Bank Manager',
        company: 'HDFC Bank',
        annualIncome: '15-20 LPA',
        heightCm: 168,
        complexion: 'fair',
        maritalStatus: 'never_married',
        aboutMe: 'Independent woman from loving Punjabi family. Love cooking and singing.',
        status: 'active'
    },
    {
        fullName: 'Divya Nair',
        gender: 'female',
        dateOfBirth: new Date('1992-04-22'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Nair',
        city: 'Trivandrum',
        state: 'Kerala',
        education: 'M.Sc',
        profession: 'Data Analyst',
        company: 'Infosys',
        annualIncome: '10-15 LPA',
        heightCm: 161,
        complexion: 'wheatish',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'vrishabh', nakshatra: 'krittika' },
        aboutMe: 'Simple Kerala girl with analytical mind. Love reading and nature.',
        status: 'active'
    },
    {
        fullName: 'Maria Joseph',
        gender: 'female',
        dateOfBirth: new Date('1995-11-30'),
        phone: getPhone(),
        religion: 'Christian',
        caste: 'Catholic',
        city: 'Goa',
        state: 'Goa',
        education: 'Hotel Management',
        profession: 'Hotel Manager',
        company: 'Taj Hotels',
        annualIncome: '12-18 LPA',
        heightCm: 164,
        complexion: 'fair',
        maritalStatus: 'never_married',
        aboutMe: 'Hospitality professional with cheerful personality. Love beaches and music.',
        status: 'active'
    },
    {
        fullName: 'Shreya Deshmukh',
        gender: 'female',
        dateOfBirth: new Date('1998-08-08'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Maratha',
        city: 'Pune',
        state: 'Maharashtra',
        education: 'B.Tech',
        profession: 'UI/UX Designer',
        company: 'Flipkart',
        annualIncome: '15-22 LPA',
        heightCm: 160,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'simha', nakshatra: 'purva_phalguni' },
        aboutMe: 'Creative designer who loves art and travel. Looking for adventurous partner.',
        status: 'active'
    },
    {
        fullName: 'Ritu Mishra',
        gender: 'female',
        dateOfBirth: new Date('1991-06-15'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Brahmin',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        education: 'MA',
        profession: 'Professor',
        company: 'BHU',
        annualIncome: '10-15 LPA',
        heightCm: 159,
        complexion: 'fair',
        maritalStatus: 'never_married',
        horoscope: { rashi: 'mithun', nakshatra: 'punarvasu' },
        aboutMe: 'Sanskrit and Hindi professor. Traditional upbringing with scholarly interests.',
        status: 'active'
    },
    {
        fullName: 'Pooja Rao',
        gender: 'female',
        dateOfBirth: new Date('1990-01-25'),
        phone: getPhone(),
        religion: 'Hindu',
        caste: 'Rao',
        city: 'Hyderabad',
        state: 'Telangana',
        education: 'MD',
        profession: 'Doctor',
        company: 'Care Hospitals',
        annualIncome: '25-35 LPA',
        heightCm: 166,
        complexion: 'wheatish',
        maritalStatus: 'divorced',
        horoscope: { rashi: 'makar', nakshatra: 'dhanishta' },
        aboutMe: 'Experienced dermatologist. Looking for mature, understanding partner.',
        status: 'active'
    },
    {
        fullName: 'Meera Jain',
        gender: 'female',
        dateOfBirth: new Date('1997-09-18'),
        phone: getPhone(),
        religion: 'Jain',
        caste: 'Jain',
        city: 'Indore',
        state: 'Madhya Pradesh',
        education: 'B.Com',
        profession: 'Business Owner',
        company: 'Family Business - Jewelry',
        annualIncome: '20-30 LPA',
        heightCm: 157,
        complexion: 'fair',
        maritalStatus: 'never_married',
        diet: 'jain',
        horoscope: { rashi: 'kanya', nakshatra: 'chitra' },
        aboutMe: 'From traditional Jain business family. Value simplicity and ethics.',
        status: 'active'
    }
];

async function seed() {
    try {
        console.log('🌱 Starting database seed...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Initialize config
        console.log('📋 Initializing configuration...');
        await Configuration.getConfig();
        console.log('   Config initialized with defaults\n');

        // Delete all test users first
        console.log('🗑️  Deleting existing test data...');
        for (const userData of USERS) {
            await User.deleteOne({ phone: userData.phone });
        }
        // Delete sample profiles by phone range
        await Profile.deleteMany({ phone: { $gte: '8800000001', $lte: '8800000100' } });
        console.log('   Done\n');

        // Create users - password will be hashed by User model pre-save hook
        console.log('👥 Creating test users...\n');
        const createdUsers = {};

        for (const userData of USERS) {
            const user = await User.create({
                name: userData.name,
                phone: userData.phone,
                passwordHash: userData.password, // Plain text - pre-save hook will hash
                role: userData.role,
                isVerified: userData.isVerified,
                agency: userData.agency
            });
            createdUsers[userData.role] = user;
            console.log(`   ✅ ${userData.role.padEnd(12)} - ${userData.phone} / ${userData.password}`);
        }

        // Create sample profiles
        console.log('\n📝 Creating sample matrimonial profiles...\n');

        // Distribute profiles among different users
        const profileCreators = [
            { role: 'matchmaker', count: 8 },
            { role: 'elder', count: 5 },
            { role: 'contributor', count: 6 },
            { role: 'helper', count: 5 }
        ];

        let profileIndex = 0;
        const createdProfiles = [];

        for (const { role, count } of profileCreators) {
            const creator = createdUsers[role];
            if (!creator) continue;

            for (let i = 0; i < count && profileIndex < SAMPLE_PROFILES.length; i++) {
                const profileData = SAMPLE_PROFILES[profileIndex];
                const profile = await Profile.create({
                    ...profileData,
                    createdBy: creator._id,
                    recognition: {
                        count: Math.floor(Math.random() * 5),
                        score: Math.floor(Math.random() * 50)
                    }
                });
                createdProfiles.push(profile);
                console.log(`   ✅ ${profileData.fullName} (by ${role})`);
                profileIndex++;
            }
        }

        // Create some sample recognitions
        console.log('\n🤝 Creating sample recognitions...\n');
        const adminUser = createdUsers['admin'];
        const modUser = createdUsers['moderator'];

        for (const profile of createdProfiles.slice(0, 5)) {
            try {
                await Recognition.create({
                    profile: profile._id,
                    givenBy: adminUser._id,
                    relationshipType: 'family_friend',
                    yearsKnown: Math.floor(Math.random() * 10) + 1,
                    vouches: {
                        identity: true,
                        familyBackground: true,
                        character: Math.random() > 0.3
                    }
                });
            } catch (e) {
                // Ignore duplicate recognition errors
            }
        }

        for (const profile of createdProfiles.slice(5, 10)) {
            try {
                await Recognition.create({
                    profile: profile._id,
                    givenBy: modUser._id,
                    relationshipType: 'neighbor',
                    yearsKnown: Math.floor(Math.random() * 5) + 1,
                    vouches: {
                        identity: true,
                        familyBackground: Math.random() > 0.5
                    }
                });
            } catch (e) {
                // Ignore duplicate recognition errors
            }
        }
        console.log('   ✅ Created sample recognitions\n');

        console.log('\n========================================');
        console.log('🎉 SEED COMPLETE!');
        console.log('========================================\n');
        console.log('TEST ACCOUNTS (phone / password):\n');
        console.log('┌──────────────┬─────────────┬───────────────┐');
        console.log('│ Role         │ Phone       │ Password      │');
        console.log('├──────────────┼─────────────┼───────────────┤');
        USERS.forEach(u => {
            console.log(`│ ${u.role.padEnd(12)} │ ${u.phone} │ ${u.password.padEnd(13)} │`);
        });
        console.log('└──────────────┴─────────────┴───────────────┘');
        console.log(`\n📊 Created ${createdProfiles.length} sample profiles`);
        console.log('');

    } catch (error) {
        console.error('❌ Seed error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

seed();
