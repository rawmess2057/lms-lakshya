/**
 * Create Admin User on Live Database
 * 
 * This script safely creates an admin user directly on the live/production database.
 * It uses the User model to ensure proper password hashing.
 * 
 * Usage:
 *   node create-admin-live.js
 * 
 * Or with custom credentials:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123 node create-admin-live.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: join(__dirname, envFile) });
dotenv.config({ path: join(__dirname, '.env') });

// Admin credentials (can be overridden by environment variables)
const adminEmail = process.env.ADMIN_EMAIL || 'admin@lakshyaacademy.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2026';
const adminName = process.env.ADMIN_NAME || 'Admin User';

console.log('🔧 Create Admin User on Live Database\n');
console.log('='.repeat(60));

// Verify environment
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in environment variables');
  console.error('   Make sure .env.production file exists in backend/ directory');
  process.exit(1);
}

// Show what will be created (mask password)
console.log('Configuration:');
console.log(`   Email: ${adminEmail}`);
console.log(`   Password: ${'*'.repeat(adminPassword.length)} (${adminPassword.length} chars)`);
console.log(`   Name: ${adminName}`);
console.log(`   Role: admin`);
console.log(`   Database: ${process.env.MONGODB_URI.split('/').pop()?.split('?')[0] || 'unknown'}`);
console.log('\n⚠️  WARNING: This will create/update an admin user in the LIVE database!');
console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

// Wait 3 seconds
await new Promise(resolve => setTimeout(resolve, 3000));

try {
  // Connect to database
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Import User model
  const User = (await import('./src/models/User.js')).default;

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase().trim() });
  
  if (existingAdmin) {
    console.log(`⚠️  Admin user already exists with email: ${adminEmail}`);
    console.log('   Updating password and ensuring role is admin...\n');
    
    // Update existing admin user
    existingAdmin.password = adminPassword; // User model pre-save hook will hash it
    existingAdmin.role = 'admin';
    existingAdmin.isActive = true;
    existingAdmin.name = adminName;
    await existingAdmin.save();
    
    console.log('✅ Admin user updated successfully!');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Role: ${existingAdmin.role}`);
    console.log(`   IsActive: ${existingAdmin.isActive}`);
  } else {
    // Create new admin user
    console.log('Creating new admin user...');
    const admin = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword, // User model pre-save hook will hash it
      role: 'admin',
      isActive: true,
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   IsActive: ${admin.isActive}`);
  }

  // Verify the password works
  console.log('\n🔐 Verifying password...');
  const verifyUser = await User.findOne({ email: adminEmail.toLowerCase().trim() }).select('+password');
  
  if (!verifyUser || !verifyUser.password) {
    console.error('❌ ERROR: Could not verify password - user or password field missing');
    process.exit(1);
  }

  const passwordMatch = await verifyUser.matchPassword(adminPassword);
  
  if (passwordMatch) {
    console.log('✅ Password verification: SUCCESS');
  } else {
    console.error('❌ Password verification: FAILED');
    console.error('   This indicates a bcrypt compatibility issue');
    console.error('   Try: npm rebuild bcryptjs');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ ADMIN USER READY FOR LOGIN');
  console.log('='.repeat(60));
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('\n⚠️  IMPORTANT: Change this password after first login!');
  console.log('   You can do this through the admin panel or by updating the user in the database.');

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nPossible causes:');
  console.error('   1. Database connection failed');
  console.error('   2. User model import failed');
  console.error('   3. bcrypt hashing failed');
  console.error('   4. Database permissions issue');
  console.error('\nFull error:', error);
  process.exit(1);
} finally {
  // Close database connection
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed.');
}

