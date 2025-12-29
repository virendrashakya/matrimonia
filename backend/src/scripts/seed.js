/**
 * Database Seed Script - Comprehensive Sample Data
 * Creates: 1 Admin, 2 Moderators, 3 Matchmakers (25 profiles each), 30 EndUsers (1 each)
 * Total: 36 users, 105 profiles
 * 
 * Run: node src/scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Profile, Configuration } = require('../models');

// Indian names and data
const MALE_NAMES = [
    'Rahul Sharma', 'Amit Verma', 'Vikram Singh', 'Arjun Patel', 'Sanjay Gupta',
    'Deepak Kumar', 'Rajesh Agarwal', 'Sunil Yadav', 'Manoj Mishra', 'Anil Joshi',
    'Vivek Reddy', 'Rohit Kapoor', 'Nitin Saxena', 'Pankaj Dubey', 'Ashish Tiwari',
    'Gaurav Chauhan', 'Pradeep Pandey', 'Mukesh Thakur', 'Dinesh Goyal', 'Ramesh Bhatia',
    'Naveen Rao', 'Sandeep Das', 'Rakesh Bansal', 'Vishal Mehta', 'Hemant Jain',
    'Abhishek Kulkarni', 'Vikas Chaudhary', 'Suresh Shukla', 'Kamal Rathi', 'Anand Srivastava'
];

const FEMALE_NAMES = [
    'Priya Sharma', 'Neha Agarwal', 'Ananya Singh', 'Kavita Patel', 'Sneha Iyer',
    'Pooja Gupta', 'Ritu Verma', 'Swati Mishra', 'Anjali Yadav', 'Divya Kapoor',
    'Meera Jain', 'Shreya Deshmukh', 'Sunita Reddy', 'Nisha Saxena', 'Rekha Tiwari',
    'Vandana Pandey', 'Seema Thakur', 'Komal Goyal', 'Preeti Bhatia', 'Shweta Rao',
    'Archana Das', 'Mamta Bansal', 'Kavya Mehta', 'Deepa Kulkarni', 'Aarti Chaudhary',
    'Radha Shukla', 'Kiran Rathi', 'Nandini Srivastava', 'Pallavi Dubey', 'Suman Joshi'
];

const CASTES = ['Brahmin', 'Rajput', 'Agarwal', 'Gupta', 'Baniya', 'Jat', 'Kayastha', 'Yadav', 'Marwari', 'Patel'];
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Jaipur', 'Lucknow', 'Kolkata', 'Ahmedabad'];
const STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Gujarat'];
const EDUCATIONS = ['B.Tech', 'MBA', 'MBBS', 'B.Com', 'CA', 'M.Tech', 'BBA', 'LLB', 'B.Sc', 'MA'];
const PROFESSIONS = ['Software Engineer', 'Doctor', 'CA', 'Business Owner', 'Banker', 'Teacher', 'Government Job', 'Lawyer', 'Manager', 'Engineer'];
const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Google', 'Microsoft', 'HDFC Bank', 'Government', 'Self-employed', 'Reliance', 'L&T'];
const INCOMES = ['5-10 LPA', '10-15 LPA', '15-25 LPA', '25-40 LPA', '40+ LPA'];
const VISIBILITIES = ['public', 'public', 'public', 'restricted', 'private']; // More public
const RASHIS = ['mesh', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya', 'tula', 'vrishchik', 'dhanu', 'makar', 'kumbh', 'meen'];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let phoneCounter = 9000000001;
const getPhone = () => String(phoneCounter++);

// Generate a random profile
function generateProfile(gender, createdBy) {
    const names = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
    const name = random(names);
    const cityIndex = randomInt(0, CITIES.length - 1);
    const birthYear = randomInt(1988, 2000);

    return {
        fullName: name,
        gender,
        dateOfBirth: new Date(`${birthYear}-${randomInt(1, 12).toString().padStart(2, '0')}-${randomInt(1, 28).toString().padStart(2, '0')}`),
        phone: getPhone(),
        religion: 'Hindu',
        caste: random(CASTES),
        city: CITIES[cityIndex],
        state: STATES[cityIndex],
        education: random(EDUCATIONS),
        profession: random(PROFESSIONS),
        company: random(COMPANIES),
        annualIncome: random(INCOMES),
        heightCm: gender === 'male' ? randomInt(165, 185) : randomInt(150, 170),
        complexion: random(['fair', 'wheatish', 'wheatish_brown']),
        maritalStatus: Math.random() > 0.9 ? 'divorced' : 'never_married',
        horoscope: { rashi: random(RASHIS) },
        aboutMe: `Looking for a suitable life partner. Family-oriented with modern values.`,
        visibility: random(VISIBILITIES),
        status: 'active',
        createdBy
    };
}

async function seed() {
    try {
        console.log('🌱 Starting comprehensive database seed...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Initialize config
        console.log('📋 Initializing configuration...');
        await Configuration.getConfig();
        console.log('   Config initialized\n');

        // Clear existing data
        console.log('🗑️  Clearing existing test data...');
        await User.deleteMany({ phone: { $gte: '9000000001', $lte: '9000000999' } });
        await Profile.deleteMany({ phone: { $gte: '9000000001', $lte: '9000999999' } });
        console.log('   Done\n');

        const createdUsers = [];
        let profileCount = 0;

        // ============================
        // 1. CREATE ADMIN (1)
        // ============================
        console.log('👑 Creating Admin...');
        const admin = await User.create({
            name: 'Admin User',
            phone: '9000000001',
            passwordHash: 'admin123',
            role: 'admin',
            isVerified: true
        });
        createdUsers.push(admin);
        console.log('   ✅ Admin: 9000000001 / admin123\n');

        // ============================
        // 2. CREATE MODERATORS (2)
        // ============================
        console.log('🛡️  Creating Moderators...');
        for (let i = 1; i <= 2; i++) {
            const mod = await User.create({
                name: `Moderator ${i}`,
                phone: `900000000${i + 1}`,
                passwordHash: 'mod123',
                role: 'moderator',
                isVerified: true
            });
            createdUsers.push(mod);
            console.log(`   ✅ Moderator ${i}: 900000000${i + 1} / mod123`);
        }
        console.log('');

        // ============================
        // 3. CREATE MATCHMAKERS (3) with 25 profiles each
        // ============================
        console.log('💼 Creating Matchmakers with 25 profiles each...');
        const matchmakerAgencies = [
            { name: 'शुभ विवाह', city: 'Delhi' },
            { name: 'Premium Matches', city: 'Mumbai' },
            { name: 'Divine Matrimony', city: 'Bangalore' }
        ];

        for (let m = 0; m < 3; m++) {
            const matchmaker = await User.create({
                name: matchmakerAgencies[m].name,
                phone: `900000010${m + 1}`,
                passwordHash: 'match123',
                role: 'matchmaker',
                isVerified: true,
                agency: {
                    name: matchmakerAgencies[m].name,
                    city: matchmakerAgencies[m].city,
                    establishedYear: 2010 + m
                }
            });
            createdUsers.push(matchmaker);
            console.log(`   ✅ Matchmaker ${m + 1}: 900000010${m + 1} / match123`);

            // Create 25 profiles for this matchmaker
            for (let p = 0; p < 25; p++) {
                const gender = p < 12 ? 'male' : 'female';
                const profile = await Profile.create(generateProfile(gender, matchmaker._id));
                profileCount++;
            }
            console.log(`      Created 25 profiles for ${matchmakerAgencies[m].name}`);
        }
        console.log('');

        // ============================
        // 4. CREATE ENDUSERS (30) with 1 profile each
        // ============================
        console.log('👤 Creating EndUsers with 1 profile each...');
        for (let u = 0; u < 30; u++) {
            const gender = u < 15 ? 'male' : 'female';
            const names = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;

            const enduser = await User.create({
                name: names[u % names.length],
                phone: `900000020${u.toString().padStart(2, '0')}`,
                passwordHash: 'user123',
                role: 'enduser',
                isVerified: u < 25 // 5 unverified users
            });
            createdUsers.push(enduser);

            // Create 1 profile for this enduser
            const profile = await Profile.create(generateProfile(gender, enduser._id));
            profileCount++;

            if (u < 5 || u >= 25) {
                console.log(`   ✅ EndUser ${u + 1}: 900000020${u.toString().padStart(2, '0')} / user123`);
            }
        }
        console.log(`   ... and 25 more endusers`);
        console.log('');

        // ============================
        // SUMMARY
        // ============================
        console.log('\n========================================');
        console.log('🎉 SEED COMPLETE!');
        console.log('========================================\n');

        console.log('📊 DATA SUMMARY:');
        console.log('┌──────────────┬───────┬───────────┐');
        console.log('│ Role         │ Users │ Profiles  │');
        console.log('├──────────────┼───────┼───────────┤');
        console.log('│ Admin        │   1   │     0     │');
        console.log('│ Moderator    │   2   │     0     │');
        console.log('│ Matchmaker   │   3   │    75     │');
        console.log('│ EndUser      │  30   │    30     │');
        console.log('├──────────────┼───────┼───────────┤');
        console.log(`│ TOTAL        │  36   │   ${profileCount}     │`);
        console.log('└──────────────┴───────┴───────────┘');

        console.log('\n🔑 TEST ACCOUNTS:');
        console.log('┌──────────────┬─────────────┬───────────┐');
        console.log('│ Role         │ Phone       │ Password  │');
        console.log('├──────────────┼─────────────┼───────────┤');
        console.log('│ Admin        │ 9000000001  │ admin123  │');
        console.log('│ Moderator 1  │ 9000000002  │ mod123    │');
        console.log('│ Moderator 2  │ 9000000003  │ mod123    │');
        console.log('│ Matchmaker 1 │ 9000001001  │ match123  │');
        console.log('│ Matchmaker 2 │ 9000001002  │ match123  │');
        console.log('│ Matchmaker 3 │ 9000001003  │ match123  │');
        console.log('│ EndUser      │ 9000002000  │ user123   │');
        console.log('└──────────────┴─────────────┴───────────┘');
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
