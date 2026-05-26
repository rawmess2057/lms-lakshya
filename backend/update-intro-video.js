/**
 * Update Global Intro Video
 * This script updates or creates the global intro video in the database
 * 
 * Usage:
 *   node update-intro-video.js
 * 
 * Or with custom URL:
 *   VIDEO_URL=https://www.youtube.com/watch?v=YOUR_VIDEO_ID node update-intro-video.js
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

const videoUrl = process.env.VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const videoTitle = process.env.VIDEO_TITLE || 'Welcome to Lakshya Academy - Platform Introduction';
const videoDescription = process.env.VIDEO_DESCRIPTION || 'Learn how to navigate and use Lakshya Academy. This video will guide you through all the features including course browsing, enrollment, video watching, quizzes, assignments, and certificate generation.';

async function updateIntroVideo() {
  try {
    console.log('🎥 Updating Global Intro Video...\n');
    console.log('='.repeat(60));
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI not found');
      process.exit(1);
    }
    
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('   Database:', mongoose.connection.name);
    console.log('');
    
    const IntroVideo = (await import('./src/models/IntroVideo.js')).default;
    
    // Check if global intro video exists
    console.log('🔍 Checking for existing global intro video...');
    let introVideo = await IntroVideo.findOne({ type: 'global' });
    
    if (introVideo) {
      console.log('   ✅ Found existing global intro video');
      console.log('   Current URL:', introVideo.videoUrl);
      console.log('   Updating...');
      
      introVideo.videoUrl = videoUrl;
      introVideo.title = videoTitle;
      introVideo.description = videoDescription;
      introVideo.isActive = true;
      await introVideo.save();
      
      console.log('   ✅ Intro video updated');
    } else {
      console.log('   ⚠️  No existing global intro video found');
      console.log('   Creating new global intro video...');
      
      introVideo = await IntroVideo.create({
        title: videoTitle,
        description: videoDescription,
        videoUrl: videoUrl,
        type: 'global',
        order: 0,
        isActive: true,
      });
      
      console.log('   ✅ Global intro video created');
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Global Intro Video Updated Successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Video Details:');
    console.log('   Title:', introVideo.title);
    console.log('   URL:', introVideo.videoUrl);
    console.log('   Type: global');
    console.log('   Active:', introVideo.isActive);
    console.log('');
    console.log('🌐 The video will now appear on:');
    console.log('   - Landing page (homepage)');
    console.log('   - Intro video page: /intro-video/global');
    console.log('');
    console.log('📝 To update again:');
    console.log('   VIDEO_URL="your-new-url" node update-intro-video.js');
    
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

updateIntroVideo();

