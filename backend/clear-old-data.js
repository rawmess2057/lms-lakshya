/**
 * Clear Old Test Data from Database
 * This will remove all data from collections (fresh start)
 * Run: node clear-old-data.js
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

async function clearData() {
  try {
    console.log('🗑️  Clearing Old Test Data from Database...\n');
    console.log('='.repeat(60));
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI not found');
      process.exit(1);
    }
    
    // Show which database we're connecting to
    const dbNameMatch = process.env.MONGODB_URI.match(/\/([^?]+)\?/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    console.log('📋 Database:', dbName);
    console.log('');
    
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('   Database:', mongoose.connection.name);
    console.log('');
    
    const db = mongoose.connection.db;
    
    // List of collections to clear (excluding system collections)
    const collectionsToClear = [
      'users',
      'courses',
      'videos',
      'materials',
      'quizzes',
      'assignments',
      'submissions',
      'payments',
      'certificates',
      'categories',
      'subjects',
      'progress',
      'liveclasses',
      'introvideos',
      'socialmedias',
      'adminconfigs',
      'activitylogs'
    ];
    
    console.log('📊 Current data counts:');
    for (const collectionName of collectionsToClear) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`   ${collectionName}: ${count} documents`);
        }
      } catch (error) {
        // Collection might not exist, that's okay
      }
    }
    console.log('');
    
    // Ask for confirmation (automated - will proceed)
    console.log('⚠️  WARNING: This will delete ALL data from the above collections!');
    console.log('   Starting cleanup in 3 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear each collection
    console.log('🗑️  Deleting old data...');
    let totalDeleted = 0;
    
    for (const collectionName of collectionsToClear) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        if (result.deletedCount > 0) {
          console.log(`   ✅ ${collectionName}: Deleted ${result.deletedCount} documents`);
          totalDeleted += result.deletedCount;
        }
      } catch (error) {
        // Collection might not exist, skip it
        console.log(`   ⏭️  ${collectionName}: Collection doesn't exist or error (skipping)`);
      }
    }
    
    console.log('');
    console.log(`✅ Total documents deleted: ${totalDeleted}`);
    console.log('');
    
    // Verify collections are empty
    console.log('📊 Verifying cleanup:');
    for (const collectionName of collectionsToClear) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`   ${collectionName}: ${count} documents`);
      } catch (error) {
        console.log(`   ${collectionName}: Collection doesn't exist`);
      }
    }
    console.log('');
    
    // Recreate admin user
    console.log('👤 Recreating admin user...');
    const usersCollection = db.collection('users');
    const bcrypt = (await import('bcryptjs')).default;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Myacademy@2026', salt);
    
    await usersCollection.insertOne({
      name: 'Admin User',
      email: 'lakshyaacademy1@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('   ✅ Admin user created');
    console.log('   Email: lakshyaacademy1@gmail.com');
    console.log('   Password: Myacademy@2026');
    console.log('');
    
    console.log('='.repeat(60));
    console.log('✅ Database cleanup complete!');
    console.log('✅ Admin user recreated');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Restart backend: pm2 restart all');
    console.log('   2. Login at: http://72.62.73.177/login/teacher');
    console.log('   3. Start with a fresh database!');
    
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

clearData();

