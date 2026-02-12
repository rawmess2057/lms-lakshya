import { resendVerificationEmail } from './src/controllers/authController.js';
import User from './src/models/User.js';
import * as emailService from './src/utils/emailService.js';

// Mock objects
const req = {
    body: {}
};

const res = {
    statusCode: 0,
    jsonData: null,
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        this.jsonData = data;
        return this;
    }
};

// Mock User model
User.findOne = async function (query) {
    console.log(`[Mock] User.findOne called with:`, query);
    if (query.email === 'missing@example.com') return null;
    if (query.email === 'verified@example.com') return {
        email: 'verified@example.com',
        isVerified: true
    };
    if (query.email === 'unverified@example.com') return {
        email: 'unverified@example.com',
        isVerified: false,
        generateEmailVerificationToken: function () {
            console.log('[Mock] generateEmailVerificationToken called');
            return 'mock-token';
        },
        save: async function () {
            console.log('[Mock] user.save called');
        }
    };
    return null;
};

// Mock email service
emailService.sendEmailVerification = async function (user, token) {
    console.log(`[Mock] sendEmailVerification called for ${user.email} with token ${token}`);
    return { success: true };
};

async function runTests() {
    console.log('--- Test 1: Missing Email ---');
    req.body = {};
    await resendVerificationEmail(req, res);
    console.log('Result:', res.statusCode, res.jsonData);

    console.log('\n--- Test 2: User Not Found ---');
    req.body = { email: 'missing@example.com' };
    await resendVerificationEmail(req, res);
    console.log('Result:', res.statusCode, res.jsonData);

    console.log('\n--- Test 3: Already Verified ---');
    req.body = { email: 'verified@example.com' };
    await resendVerificationEmail(req, res);
    console.log('Result:', res.statusCode, res.jsonData);

    console.log('\n--- Test 4: Success ---');
    req.body = { email: 'unverified@example.com' };
    await resendVerificationEmail(req, res);
    console.log('Result:', res.statusCode, res.jsonData);
}

runTests().catch(console.error);
