import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load production env with override to ensure it takes precedence
dotenv.config({ path: path.resolve(__dirname, '.env.production'), override: true });

console.log('Environment loaded.');
console.log('CLIENT_URL:', process.env.CLIENT_URL);

const runMigration = async () => {
    try {
        // Dynamic imports to ensure env is loaded first
        const User = (await import('./src/models/User.js')).default;
        const { sendEmailVerification } = await import('./src/utils/emailService.js');

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find unverified users
        const unverifiedUsers = await User.find({ isVerified: false });
        console.log(`Found ${unverifiedUsers.length} unverified users.`);

        for (const user of unverifiedUsers) {
            console.log(`Processing user: ${user.email}`);

            // Generate new token
            const verificationToken = user.getEmailVerificationToken();
            await user.save({ validateBeforeSave: false });

            // Send email
            const result = await sendEmailVerification(user, verificationToken);
            if (result.success) {
                console.log(`✅ Email sent to ${user.email}`);
            } else {
                console.error(`❌ Failed to send email to ${user.email}: ${result.error}`);
            }
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
