/**
 * Check MongoDB Connection and Fix Admin User
 * This script:
 * 1. Checks which MongoDB database you're connected to
 * 2. Lists all users in that database
 * 3. Creates/fixes admin user in the CORRECT database
 * 
 * Run: node check-and-fix-mongodb.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: join(__dirname, envFile) });
dotenv.config({ path: join(__dirname, '.env') });

const adminEmail = 'lakshyaacademy1@gmail.com';
const adminPassword = 'Myacademy@2026';

async function checkAndFix() {
  try {
    console.log('🔍 Checking MongoDB Connection and Database...\n');
    console.log('='.repeat(60));
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI not found in environment variables');
      console.log('   Make sure .env.production exists in backend directory');
      process.exit(1);
    }
    
    // Show which database we're connecting to (masked password)
    const maskedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log('📋 MongoDB Connection String:');
    console.log('   ' + maskedUri);
    console.log('');
    
    // Extract database name from URI
    const dbNameMatch = process.env.MONGODB_URI.match(/\/([^?]+)\?/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    console.log('📊 Database Name:', dbName);
    console.log('');
    
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('');
    
    const User = (await import('./src/models/User.js')).default;
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Count all users
    const totalUsers = await usersCollection.countDocuments();
    console.log('👥 Total users in database:', totalUsers);
    console.log('');
    
    // List all admin users
    console.log('👑 Admin users in this database:');
    const adminUsers = await usersCollection.find({ role: 'admin' }).toArray();
    if (adminUsers.length === 0) {
      console.log('   ❌ No admin users found');
    } else {
      adminUsers.forEach((u, index) => {
        console.log(`   ${index + 1}. ${u.email} (active: ${u.isActive})`);
      });
    }
    console.log('');
    
    // Check if our admin user exists
    console.log('🔍 Checking for admin user:', adminEmail);
    let adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      console.log('   ❌ Admin user NOT FOUND in this database');
      console.log('   💡 Creating admin user in this database...');
      
      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      
      console.log('   ✅ Admin user CREATED');
      console.log('      Email:', adminUser.email);
      console.log('      Role:', adminUser.role);
      console.log('      IsActive:', adminUser.isActive);
    } else {
      console.log('   ✅ Admin user FOUND');
      console.log('      Email:', adminUser.email);
      console.log('      Role:', adminUser.role);
      console.log('      IsActive:', adminUser.isActive);
      
      // Fix if needed
      let needsUpdate = false;
      
      if (!adminUser.isActive) {
        console.log('   ⚠️  User is not active - fixing...');
        adminUser.isActive = true;
        needsUpdate = true;
      }
      
      if (adminUser.role !== 'admin') {
        console.log('   ⚠️  Role is not admin - fixing...');
        adminUser.role = 'admin';
        needsUpdate = true;
      }
      
      // Test password
      const passwordMatch = await adminUser.matchPassword(adminPassword);
      if (!passwordMatch) {
        console.log('   ⚠️  Password does not match - resetting...');
        adminUser.password = adminPassword;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await adminUser.save();
        console.log('   ✅ Admin user UPDATED');
      } else {
        console.log('   ✅ Admin user is correct');
      }
    }
    
    // Final verification
    console.log('');
    console.log('🔐 Final Verification:');
    const finalUser = await User.findOne({ email: adminEmail }).select('+password');
    const finalMatch = await finalUser.matchPassword(adminPassword);
    
    if (finalMatch && finalUser.isActive && finalUser.role === 'admin') {
      console.log('   ✅ Password: WORKING');
      console.log('   ✅ Role: admin');
      console.log('   ✅ IsActive: true');
      console.log('');
      console.log('🎉 Admin user is ready for login!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log('   URL: http://72.62.73.177/login/teacher (or /login/student)');
      console.log('   Email: lakshyaacademy1@gmail.com');
      console.log('   Password: Myacademy@2026');
    } else {
      console.log('   ❌ Verification failed:');
      if (!finalMatch) console.log('      - Password does not match');
      if (!finalUser.isActive) console.log('      - User is not active');
      if (finalUser.role !== 'admin') console.log('      - Role is not admin');
      console.log('');
      console.log('⚠️  Try running: npm rebuild bcryptjs');
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 Database Summary:');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Total Users:', totalUsers);
    console.log('   Admin Users:', adminUsers.length);
    console.log('='.repeat(60));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

checkAndFix();

