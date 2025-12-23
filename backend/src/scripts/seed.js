/**
 * Database Seed Script
 * Creates test users with all available roles
 * 
 * Run: node src/scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Configuration } = require('../models');

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
        agencyName: 'शुभ विवाह मैचमेकर्स'
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

async function seed() {
    try {
        console.log('🌱 Starting database seed...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Initialize config
        console.log('📋 Initializing configuration...');
        await Configuration.getConfig();
        console.log('   Config initialized with defaults\n');

        // Create users
        console.log('👥 Creating test users...\n');

        for (const userData of USERS) {
            const existing = await User.findOne({ phone: userData.phone });

            if (existing) {
                console.log(`   ⏭️  ${userData.role.padEnd(12)} - ${userData.phone} (already exists)`);
                continue;
            }

            const passwordHash = await bcrypt.hash(userData.password, 10);

            await User.create({
                name: userData.name,
                phone: userData.phone,
                passwordHash,
                role: userData.role,
                isVerified: userData.isVerified,
                agencyName: userData.agencyName
            });

            console.log(`   ✅ ${userData.role.padEnd(12)} - ${userData.phone} / ${userData.password}`);
        }

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
        console.log('\nRole Permissions:');
        console.log('  • admin       - Full access, manage users/config');
        console.log('  • moderator   - Edit/flag profiles, verify users');
        console.log('  • matchmaker  - Add profiles with agency branding');
        console.log('  • elder       - Import WhatsApp, bulk add profiles');
        console.log('  • helper      - Limited adding capability');
        console.log('  • contributor - Default role, basic access');
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
