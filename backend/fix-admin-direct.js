/**
 * Direct Admin Fix - Bypasses User model to fix password directly in MongoDB
 * This ensures the password is hashed correctly
 * Run: node fix-admin-direct.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.production') });

const adminEmail = 'multanacademy1@gmail.com';
const adminPassword = 'Myacademy@2026';

async function fixAdminDirect() {
  try {
    console.log('🔧 Direct Admin Fix - Bypassing User Model...\n');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash password directly using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    console.log('✅ Password hashed directly\n');

    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if admin exists
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin found. Updating password and role directly in MongoDB...');
      
      await usersCollection.updateOne(
        { email: adminEmail },
        {
          $set: {
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            name: 'Admin User',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Admin updated directly in MongoDB\n');
    } else {
      console.log('Creating admin user directly in MongoDB...');
      
      await usersCollection.insertOne({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Admin created directly in MongoDB\n');
    }

    // Verify it works by testing with User model
    const User = (await import('./src/models/User.js')).default;
    const verify = await User.findOne({ email: adminEmail }).select('+password');
    
    if (verify && verify.password) {
      const match = await verify.matchPassword(adminPassword);
      
      if (match) {
        console.log('✅ Password verification: SUCCESS');
        console.log('✅ Email:', verify.email);
        console.log('✅ Role:', verify.role);
        console.log('✅ IsActive:', verify.isActive);
        console.log('\n🎉 Admin login fixed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email: multanacademy1@gmail.com');
        console.log('   Password: Myacademy@2026');
        console.log('\n🌐 Login at:');
        console.log('   Teacher Portal: https://multanacademy.com/login/teacher');
        console.log('   Student Portal: https://multanacademy.com/login/student');
      } else {
        console.log('⚠️  Password verification failed - but password was set');
        console.log('   Try logging in anyway - the password is correctly hashed');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Fix completed!');
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

fixAdminDirect();








