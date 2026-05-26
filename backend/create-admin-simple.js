/**
 * Simple Admin User Creator
 * This script will DEFINITELY create the admin user in your MongoDB database
 * Run: node create-admin-simple.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

async function createAdmin() {
  try {
    console.log('🔧 Creating Admin User in MongoDB...\n');
    console.log('='.repeat(60));
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI not found in environment variables');
      console.log('   Make sure .env.production exists in backend directory');
      process.exit(1);
    }
    
    // Show which database we're connecting to
    const dbNameMatch = process.env.MONGODB_URI.match(/\/([^?]+)\?/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    console.log('📋 Database:', dbName);
    console.log('📧 Admin Email:', adminEmail);
    console.log('🔑 Admin Password:', adminPassword);
    console.log('');
    
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    console.log('👤 Checking if admin user exists...');
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('   ⚠️  Admin user already exists');
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   IsActive:', existingAdmin.isActive);
      console.log('');
      console.log('   Resetting password and ensuring correct settings...');
      
      // Hash password directly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Update admin user
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
      
      console.log('   ✅ Admin user updated');
    } else {
      console.log('   ❌ Admin user NOT FOUND');
      console.log('   Creating new admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Create admin user
      await usersCollection.insertOne({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('   ✅ Admin user created');
    }
    
    // Verify it was created/updated
    console.log('');
    console.log('🔐 Verifying admin user...');
    const verifyAdmin = await usersCollection.findOne({ email: adminEmail });
    
    if (verifyAdmin) {
      console.log('   ✅ Admin user exists in database');
      console.log('   Email:', verifyAdmin.email);
      console.log('   Role:', verifyAdmin.role);
      console.log('   IsActive:', verifyAdmin.isActive);
      console.log('   Has Password:', !!verifyAdmin.password);
      console.log('   Password Hash Length:', verifyAdmin.password?.length || 0);
      
      // Test password
      const passwordMatch = await bcrypt.compare(adminPassword, verifyAdmin.password);
      if (passwordMatch) {
        console.log('   ✅ Password verification: SUCCESS');
        console.log('');
        console.log('='.repeat(60));
        console.log('🎉 Admin user is ready for login!');
        console.log('='.repeat(60));
        console.log('');
        console.log('📋 Login Credentials:');
        console.log('   URL: http://72.62.73.177/login/teacher');
        console.log('   Email: lakshyaacademy1@gmail.com');
        console.log('   Password: Myacademy@2026');
        console.log('');
      } else {
        console.log('   ❌ Password verification: FAILED');
        console.log('   ⚠️  There may be a bcrypt compatibility issue');
      }
    } else {
      console.log('   ❌ ERROR: Admin user not found after creation');
    }
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
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

createAdmin();

