/**
 * Deployment Verification Script
 * 
 * This script verifies all deployment configuration:
 * - Environment variables
 * - Database connection
 * - User existence
 * - Password hashing compatibility
 * 
 * Run this on your server to diagnose deployment issues.
 * 
 * Usage:
 *   node verify-deployment.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: join(__dirname, envFile) });
dotenv.config({ path: join(__dirname, '.env') }); // Also try base .env

console.log('🔍 Deployment Verification Script\n');
console.log('='.repeat(60));
console.log('ENVIRONMENT VARIABLES CHECK');
console.log('='.repeat(60));

// Check required environment variables
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
];

const missingVars = [];
const presentVars = [];

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: NOT SET`);
  } else {
    presentVars.push(varName);
    // Mask sensitive values
    if (varName === 'MONGODB_URI') {
      const masked = value.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      console.log(`✅ ${varName}: ${masked}`);
    } else if (varName === 'JWT_SECRET') {
      console.log(`✅ ${varName}: ${value.length} characters (hidden)`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️  WARNING: ${missingVars.length} required environment variable(s) are missing!`);
  console.log('   Missing:', missingVars.join(', '));
  console.log('   Action: Create/update .env.production file in backend/ directory');
} else {
  console.log('\n✅ All required environment variables are set');
}

console.log('\n' + '='.repeat(60));
console.log('DATABASE CONNECTION CHECK');
console.log('='.repeat(60));

if (!process.env.MONGODB_URI) {
  console.log('❌ Cannot test database connection: MONGODB_URI not set');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Database connection: SUCCESS');
  console.log(`   Host: ${mongoose.connection.host}`);
  console.log(`   Database: ${mongoose.connection.name}`);
  console.log(`   Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
} catch (error) {
  console.log('❌ Database connection: FAILED');
  console.log(`   Error: ${error.message}`);
  console.log('\n   Possible causes:');
  console.log('   1. Incorrect MONGODB_URI');
  console.log('   2. Network/firewall blocking connection');
  console.log('   3. MongoDB server is down');
  console.log('   4. Wrong database credentials');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('USER COLLECTION CHECK');
console.log('='.repeat(60));

try {
  const User = (await import('./src/models/User.js')).default;
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  
  const userCount = await usersCollection.countDocuments();
  console.log(`✅ Users collection exists`);
  console.log(`   Total users: ${userCount}`);
  
  if (userCount === 0) {
    console.log('\n⚠️  WARNING: No users found in database!');
    console.log('   Action: Create admin user using create-admin-user.js script');
  } else {
    // Check for admin user
    const adminCount = await usersCollection.countDocuments({ role: 'admin' });
    console.log(`   Admin users: ${adminCount}`);
    
    if (adminCount === 0) {
      console.log('\n⚠️  WARNING: No admin users found!');
      console.log('   Action: Create admin user using create-admin-user.js script');
    }
    
    // Check for active users
    const activeCount = await usersCollection.countDocuments({ isActive: true });
    console.log(`   Active users: ${activeCount}`);
    
    // Sample a few users to check password field
    const sampleUsers = await usersCollection.find({}).limit(3).toArray();
    console.log('\n   Sample users:');
    sampleUsers.forEach((user, index) => {
      const hasPassword = !!user.password;
      const passwordLength = user.password?.length || 0;
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - Password: ${hasPassword ? `✅ ${passwordLength} chars` : '❌ MISSING'}`);
    });
  }
} catch (error) {
  console.log('❌ Error checking users collection:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('BCRYPT COMPATIBILITY CHECK');
console.log('='.repeat(60));

try {
  // Test bcrypt functionality
  const testPassword = 'test-password-123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(testPassword, salt);
  const match = await bcrypt.compare(testPassword, hash);
  
  if (match) {
    console.log('✅ bcrypt is working correctly');
    console.log(`   Hash length: ${hash.length} characters`);
    console.log(`   Salt rounds: 10`);
  } else {
    console.log('❌ bcrypt comparison failed (this should never happen)');
  }
} catch (error) {
  console.log('❌ bcrypt error:', error.message);
  console.log('\n   Possible causes:');
  console.log('   1. bcrypt module not installed: npm install bcryptjs');
  console.log('   2. Node.js version incompatibility');
  console.log('   3. Need to rebuild: npm rebuild bcryptjs');
}

console.log('\n' + '='.repeat(60));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(60));

if (missingVars.length === 0) {
  console.log('✅ Environment variables: OK');
} else {
  console.log('❌ Environment variables: ISSUES FOUND');
}

if (mongoose.connection.readyState === 1) {
  console.log('✅ Database connection: OK');
} else {
  console.log('❌ Database connection: FAILED');
}

console.log('\n📋 Next Steps:');
console.log('   1. If environment variables are missing, create .env.production file');
console.log('   2. If database has no users, run: node create-admin-user.js');
console.log('   3. If login still fails, check server logs for [LOGIN DEBUG] messages');
console.log('   4. Verify frontend is calling correct API URL (not localhost)');
console.log('   5. Check CORS configuration allows your domain');

// Close database connection
await mongoose.connection.close();
console.log('\n✅ Verification complete. Database connection closed.');

