/**
 * Admin Login Fix Script
 * Run from backend directory: node fix-admin-login.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.production
dotenv.config({ path: join(__dirname, '.env.production') });

const adminEmail = 'lakshyaacademy1@gmail.com';
const adminPassword = 'Myacademy@2026';

async function fixAdmin() {
  try {
    console.log('🔧 Fixing Admin Login...\n');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.log('💡 Make sure .env.production exists in backend directory');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = (await import('./src/models/User.js')).default;
    
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('Creating admin user...');
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin created\n');
    } else {
      console.log('Admin found. Resetting password and ensuring correct role...');
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log('✅ Admin password and role updated\n');
    }

    // Verify the password works
    const verify = await User.findOne({ email: adminEmail }).select('+password');
    const match = await verify.matchPassword(adminPassword);
    
    if (match) {
      console.log('✅ Password verified: WORKING');
      console.log('✅ Email:', verify.email);
      console.log('✅ Role:', verify.role);
      console.log('✅ IsActive:', verify.isActive);
      console.log('\n🎉 Admin login fixed successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: lakshyaacademy1@gmail.com');
      console.log('   Password: Myacademy@2026');
      console.log('\n🌐 Admin can login through:');
      console.log('   ✅ Student Portal: /login/student');
      console.log('   ✅ Teacher Portal: /login/teacher');
    } else {
      console.log('❌ Password verification failed');
      console.log('⚠️  There may be an issue with password hashing');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

fixAdmin();

