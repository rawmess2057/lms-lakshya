import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);

// Try to load .env.production
const prodEnvPath = path.resolve(__dirname, '.env.production');
if (fs.existsSync(prodEnvPath)) {
    console.log('Loading .env.production from:', prodEnvPath);
    dotenv.config({ path: prodEnvPath });
} else {
    console.log('.env.production not found at:', prodEnvPath);
}

// Try to load .env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('Loading .env from:', envPath);
    dotenv.config({ path: envPath });
} else {
    console.log('.env not found at:', envPath);
}

// Check for MONGODB_URI (as used in database.js) or MONGO_URI (fallback)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
console.log('MONGODB_URI is:', mongoUri ? 'Set' : 'Undefined');

const migrateUsers = async () => {
    if (!mongoUri) {
        console.error('ERROR: MONGODB_URI (or MONGO_URI) is not defined. Exiting.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Update all users where isVerified is false or doesn't exist
        const result = await User.updateMany(
            {
                $or: [
                    { isVerified: false },
                    { isVerified: { $exists: false } }
                ]
            },
            {
                $set: { isVerified: true },
                $unset: { emailVerificationToken: 1, emailVerificationExpire: 1 }
            }
        );

        console.log(`Migration complete!`);
        console.log(`Matched ${result.matchedCount} users.`);
        console.log(`Modified ${result.modifiedCount} users.`);

        process.exit();
    } catch (error) {
        console.error('Error with migration:', error);
        process.exit(1);
    }
};

migrateUsers();
