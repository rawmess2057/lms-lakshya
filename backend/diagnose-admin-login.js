/**
 * Diagnose Admin Login Issue
 * This script checks the admin user and tests login
 * Run: node diagnose-admin-login.js
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

const adminEmail = 'multanacademy1@gmail.com';
const adminPassword = 'Myacademy@2026';

async function diagnose() {
  try {
    console.log('🔍 Diagnosing Admin Login Issue...\n');
    console.log('='.repeat(60));
    
    // Check environment
    console.log('📋 Environment Check:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
    console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
    console.log('');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI not found');
      console.log('   Make sure .env.production exists in backend directory');
      process.exit(1);
    }
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = (await import('./src/models/User.js')).default;
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Check if admin user exists
    console.log('👤 Checking admin user...');
    const adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user NOT FOUND in database');
      console.log('   Email searched:', adminEmail);
      console.log('\n   Checking all users with "admin" in email...');
      const similarUsers = await usersCollection.find({ 
        email: { $regex: /multanacademy|admin/i } 
      }).toArray();
      
      if (similarUsers.length > 0) {
        console.log('   Found similar users:');
        similarUsers.forEach(u => {
          console.log(`     - ${u.email} (role: ${u.role})`);
        });
      } else {
        console.log('   No similar users found');
      }
      
      console.log('\n   Checking all admin role users...');
      const allAdmins = await usersCollection.find({ role: 'admin' }).toArray();
      if (allAdmins.length > 0) {
        console.log('   Found admin users:');
        allAdmins.forEach(u => {
          console.log(`     - ${u.email} (active: ${u.isActive})`);
        });
      } else {
        console.log('   No admin users found in database');
      }
      
      console.log('\n💡 SOLUTION: Run fix-admin-login.js to create admin user');
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log('✅ Admin user FOUND');
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   IsActive:', adminUser.isActive);
    console.log('   Password field exists:', !!adminUser.password);
    console.log('   Password hash length:', adminUser.password?.length || 0);
    console.log('');
    
    // Check if user is active
    if (!adminUser.isActive) {
      console.log('❌ ISSUE: Admin user is NOT ACTIVE');
      console.log('   This will cause login to fail');
      console.log('\n💡 SOLUTION: Activating user...');
      adminUser.isActive = true;
      await adminUser.save();
      console.log('   ✅ User activated');
    }
    
    // Check role
    if (adminUser.role !== 'admin') {
      console.log('❌ ISSUE: User role is not "admin"');
      console.log('   Current role:', adminUser.role);
      console.log('\n💡 SOLUTION: Setting role to admin...');
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('   ✅ Role updated to admin');
    }
    
    // Test password
    console.log('🔐 Testing password...');
    if (!adminUser.password) {
      console.log('❌ ISSUE: Password field is missing!');
      console.log('\n💡 SOLUTION: Resetting password...');
      adminUser.password = adminPassword;
      await adminUser.save();
      console.log('   ✅ Password reset');
      
      // Re-fetch to test
      const updatedUser = await User.findOne({ email: adminEmail }).select('+password');
      const match = await updatedUser.matchPassword(adminPassword);
      if (match) {
        console.log('   ✅ Password verification: SUCCESS');
      } else {
        console.log('   ❌ Password verification: FAILED');
        console.log('   ⚠️  This indicates a bcrypt issue');
      }
    } else {
      const match = await adminUser.matchPassword(adminPassword);
      if (match) {
        console.log('✅ Password verification: SUCCESS');
        console.log('   Password matches correctly!');
      } else {
        console.log('❌ ISSUE: Password does NOT match');
        console.log('   The password in database does not match: Myacademy@2026');
        console.log('\n💡 SOLUTION: Resetting password...');
        adminUser.password = adminPassword;
        await adminUser.save();
        console.log('   ✅ Password reset');
        
        // Verify again
        const updatedUser = await User.findOne({ email: adminEmail }).select('+password');
        const verifyMatch = await updatedUser.matchPassword(adminPassword);
        if (verifyMatch) {
          console.log('   ✅ Password verification: SUCCESS');
        } else {
          console.log('   ❌ Password verification: FAILED');
          console.log('   ⚠️  This indicates a bcrypt compatibility issue');
          console.log('   Try: npm rebuild bcryptjs');
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Admin user exists');
    console.log('✅ Role:', adminUser.role);
    console.log('✅ IsActive:', adminUser.isActive);
    
    // Final verification
    const finalUser = await User.findOne({ email: adminEmail }).select('+password');
    const finalMatch = await finalUser.matchPassword(adminPassword);
    
    if (finalMatch && finalUser.isActive && finalUser.role === 'admin') {
      console.log('✅ Password: WORKING');
      console.log('\n🎉 Admin login should work now!');
      console.log('\n📋 Login Credentials:');
      console.log('   URL: http://72.62.73.177/login/teacher (or /login/student)');
      console.log('   Email: multanacademy1@gmail.com');
      console.log('   Password: Myacademy@2026');
    } else {
      console.log('❌ Password: NOT WORKING');
      console.log('\n⚠️  Issues found:');
      if (!finalMatch) console.log('   - Password does not match');
      if (!finalUser.isActive) console.log('   - User is not active');
      if (finalUser.role !== 'admin') console.log('   - Role is not admin');
      console.log('\n💡 Run: node fix-admin-login.js');
    }
    
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

diagnose();

