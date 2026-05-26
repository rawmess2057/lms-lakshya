import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Email Service Utility
 * Clean implementation using Nodemailer with Gmail SMTP
 */

// Get the directory of the current module (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the backend root directory (two levels up from src/utils)
// Load .env file from the backend root directory
// Prioritize .env.production if NODE_ENV is production
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.production') });
}
// Load .env as fallback (dotenv won't override variables if they are already set)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Get configuration from environment variables
const PLATFORM_NAME = process.env.PLATFORM_NAME || 'Lakshya Academy';
// CLIENT_URL is now accessed dynamically in functions to support proper env loading

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML string
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Create and configure Nodemailer transporter
 * Reads SMTP credentials from environment variables and verifies connection on startup
 * @returns {Object|null} - Nodemailer transporter or null if configuration is missing
 */
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPortStr = process.env.SMTP_PORT;
  const smtpPort = smtpPortStr ? parseInt(smtpPortStr, 10) : null;
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASS;

  // Validate all required environment variables
  const missingVars = [];
  if (!smtpHost || smtpHost.trim() === '') missingVars.push('SMTP_HOST');
  if (!smtpPortStr || !smtpPort || isNaN(smtpPort) || smtpPort <= 0) missingVars.push('SMTP_PORT');
  if (!smtpEmail || smtpEmail.trim() === '') missingVars.push('SMTP_EMAIL');
  if (!smtpPass || smtpPass.trim() === '') missingVars.push('SMTP_PASS');

  if (missingVars.length > 0) {
    console.error(
      `❌ [EMAIL SERVICE] Email service not configured. Missing required environment variables: ${missingVars.join(', ')}\n` +
      `   Please add these to your .env file. Note: Use SMTP_PASS (single underscore), not SMTP__PASS (double underscore).\n` +
      `   Email functionality will be disabled until configured.`
    );
    return null;
  }

  // Create SMTP configuration
  const smtpConfig = {
    host: smtpHost.trim(),
    port: smtpPort,
    secure: smtpPort === 465, // true for 465 (SSL), false for other ports (usually 587 uses STARTTLS)
    auth: {
      user: smtpEmail.trim(),
      pass: smtpPass.trim(),
    },
    tls: {
      rejectUnauthorized: false, // Set to true in production for better security
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  };

  const transporter = nodemailer.createTransport(smtpConfig);

  // Log initialization
  console.log(`✅ [EMAIL SERVICE] Email service initialized`);
  console.log(`   Host: ${smtpConfig.host}:${smtpConfig.port}`);
  console.log(`   From: ${smtpConfig.auth.user}`);
  console.log(`   Verifying SMTP connection...`);

  // Verify SMTP connection on startup (non-blocking, runs in background)
  transporter.verify()
    .then(() => {
      console.log(`✅ [EMAIL SERVICE] SMTP connection verified successfully`);
    })
    .catch((error) => {
      console.error(`❌ [EMAIL SERVICE] SMTP connection verification failed: ${error.message}`);
      if (error.code) {
        console.error(`   Error Code: ${error.code}`);
      }
      console.error(`   ⚠️  Emails may not send until SMTP connection is fixed. Check credentials and network.`);
    });

  return transporter;
};

// Create transporter instance
const transporter = createTransporter();

/**
 * Generic email sending function with proper error handling
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content (optional, will strip HTML if not provided)
 * @returns {Promise<Object>} - { success: boolean, error?: string, messageId?: string }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    return {
      success: false,
      error: 'Email service not configured. Please configure SMTP credentials in environment variables.'
    };
  }

  console.log(`📧 [EMAIL SERVICE] Sending email to: ${to} | Subject: ${subject}`);

  try {
    const mailOptions = {
      from: `"${PLATFORM_NAME}" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '').trim(), // Strip HTML tags for text fallback
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SERVICE] Email sent successfully to: ${to}`);
    console.log(`✅ [EMAIL SERVICE] Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL SERVICE] Failed to send email to: ${to}`);
    console.error(`❌ [EMAIL SERVICE] Error: ${error.message}`);

    // Provide helpful error messages for common issues (without exposing credentials)
    let userFriendlyError = error.message;

    if (error.code === 'EAUTH' || error.responseCode === 535) {
      userFriendlyError = 'Authentication failed. Please check SMTP credentials (email and password/app password).';
      console.error(`❌ [EMAIL SERVICE] Authentication error - Check SMTP_EMAIL and SMTP_PASS in .env`);
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      userFriendlyError = 'Connection to SMTP server failed. Check SMTP_HOST and SMTP_PORT.';
      console.error(`❌ [EMAIL SERVICE] Connection error - Check SMTP_HOST and SMTP_PORT in .env`);
    } else if (error.code === 'ESOCKET') {
      userFriendlyError = 'Network error. Please check your internet connection and SMTP server.';
      console.error(`❌ [EMAIL SERVICE] Socket error - Network or firewall issue`);
    } else if (error.code === 'EENVELOPE') {
      userFriendlyError = 'Invalid email address. Please check recipient email.';
      console.error(`❌ [EMAIL SERVICE] Envelope error - Invalid recipient: ${to}`);
    }

    if (error.code) {
      console.error(`❌ [EMAIL SERVICE] Error Code: ${error.code}`);
    }

    return { success: false, error: userFriendlyError };
  }
};

/**
 * Email Templates
 */

/**
 * Send registration confirmation email to new users
 * @param {Object} user - User object with name, email, and role
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendRegistrationConfirmation = async (user) => {
  console.log(`📧 [EMAIL SERVICE] Preparing registration confirmation email for: ${user.email}`);

  const { name, email, role } = user;
  const isTeacherPending = role === 'teacher_pending';

  const subject = isTeacherPending
    ? `Welcome to ${PLATFORM_NAME} - Teacher Request Submitted`
    : `Welcome to ${PLATFORM_NAME}!`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to ${escapeHtml(PLATFORM_NAME)}!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hello ${escapeHtml(name)},</p>
                  
                  ${isTeacherPending ? `
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Thank you for registering as a teacher on ${escapeHtml(PLATFORM_NAME)}.</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Your request has been submitted successfully and is currently pending admin approval.</p>
                    <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">You will receive an email notification once your teacher account has been approved.</p>
                  ` : `
                    <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">Your account has been successfully created! You can now log in and start exploring our courses.</p>
                  `}
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${process.env.CLIENT_URL || process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Login to Your Account</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">If you did not create this account, please ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send email verification email with verification link
 * @param {Object} user - User object with name and email
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendEmailVerification = async (user, verificationToken) => {
  console.log(`📧 [EMAIL SERVICE] Preparing email verification email for: ${user.email}`);

  const { name, email } = user;
  // Use APP_URL for the backend link, fallback to CLIENT_URL if not set (though APP_URL is recommended)
  const appUrl = process.env.APP_URL || process.env.CLIENT_URL || process.env.FRONTEND_URL;
  const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;
  const expiryHours = 24;

  const subject = `Verify Your Email - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Verify Your Email</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hello ${escapeHtml(name)},</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Thank you for registering with ${escapeHtml(PLATFORM_NAME)}! To complete your registration and start using your account, please verify your email address.</p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">Click the button below to verify your email:</p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Link fallback -->
                  <p style="margin: 30px 0 20px 0; font-size: 14px; color: #777;">Or copy and paste this link into your browser:</p>
                  <p style="margin: 0 0 30px 0; font-size: 14px; color: #667eea; word-break: break-all;">${verificationUrl}</p>
                  
                  <!-- Warning -->
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">⚠️ This verification link will expire in ${expiryHours} hours.</p>
                  </div>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">If you did not create this account, please ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send password reset email with reset link
 * @param {Object} user - User object with name and email
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendPasswordReset = async (user, resetToken) => {
  console.log(`📧 [EMAIL SERVICE] Preparing password reset email for: ${user.email}`);

  const { name, email } = user;
  const CLIENT_URL = process.env.CLIENT_URL || process.env.FRONTEND_URL;
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
  const expiryMinutes = 30;

  const subject = `Password Reset Request - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Password Reset Request</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hello ${escapeHtml(name)},</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">We received a request to reset your password for your ${escapeHtml(PLATFORM_NAME)} account.</p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">Click the button below to reset your password:</p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f5576c; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Link fallback -->
                  <p style="margin: 30px 0 20px 0; font-size: 14px; color: #777;">Or copy and paste this link into your browser:</p>
                  <p style="margin: 0 0 30px 0; font-size: 14px; color: #667eea; word-break: break-all;">${resetUrl}</p>
                  
                  <!-- Warning -->
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">⚠️ This link will expire in ${expiryMinutes} minutes.</p>
                  </div>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send payment approval notification to student
 * @param {Object} student - Student object with name and email
 * @param {string} courseTitle - Title of the course
 * @param {string} paymentReferenceId - Payment reference ID
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendPaymentApproval = async (student, courseTitle, paymentReferenceId) => {
  console.log(`📧 [EMAIL SERVICE] Preparing payment approval email for: ${student.email}`);

  const { name, email } = student;

  const subject = `Payment Approved - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Approved! 🎉</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hello ${escapeHtml(name)},</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Great news! Your payment for the course <strong>"${escapeHtml(courseTitle)}"</strong> has been approved and verified.</p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">You are now enrolled in this course and can start learning immediately!</p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${process.env.CLIENT_URL || process.env.FRONTEND_URL}/courses" style="display: inline-block; padding: 14px 32px; background-color: #11998e; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View My Courses</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Payment Reference -->
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;"><strong>Payment Reference ID:</strong> ${escapeHtml(paymentReferenceId)}</p>
                  </div>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">Thank you for choosing ${escapeHtml(PLATFORM_NAME)}!</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send certificate completion email to student
 * @param {Object} student - Student object with name and email
 * @param {string} courseTitle - Title of the completed course
 * @param {string} certificateUrl - URL to the certificate
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendCertificateCompletion = async (student, courseTitle, certificateUrl) => {
  console.log(`📧 [EMAIL SERVICE] Preparing certificate completion email for: ${student.email}`);

  const { name, email } = student;

  const subject = `Certificate of Completion - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Congratulations! 🎓</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hello ${escapeHtml(name)},</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Congratulations! You have successfully completed the course <strong>"${escapeHtml(courseTitle)}"</strong>.</p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">Your certificate of completion is ready! You can download it from your dashboard.</p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${process.env.CLIENT_URL || process.env.FRONTEND_URL}/certificates" style="display: inline-block; padding: 14px 32px; background-color: #f6d365; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View My Certificates</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 14px; color: #777; text-align: center;">Keep up the excellent work! We're proud of your achievement. 🎉</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send admin notification about new user registration
 * @param {string} adminEmail - Admin email address
 * @param {Object} newUser - New user object with name, email, role, and createdAt
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendAdminNewUserNotification = async (adminEmail, newUser) => {
  console.log(`📧 [EMAIL SERVICE] Preparing admin notification email for: ${adminEmail}`);

  const subject = `New User Registration - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">New User Registration</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">A new user has registered on ${escapeHtml(PLATFORM_NAME)}:</p>
                  
                  <!-- User Details -->
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Name:</strong> ${escapeHtml(newUser.name)}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Email:</strong> ${escapeHtml(newUser.email)}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Role:</strong> ${escapeHtml(newUser.role)}</p>
                    <p style="margin: 0; font-size: 16px; color: #333;"><strong>Registered:</strong> ${newUser.createdAt ? new Date(newUser.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  
                  ${newUser.role === 'teacher_pending' ? `
                    <!-- Teacher Pending Alert -->
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #856404; font-weight: bold;">⚠️ Action Required: This is a pending teacher request that requires approval.</p>
                    </div>
                    
                    <!-- Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.CLIENT_URL || process.env.FRONTEND_URL}/admin/teacher-requests" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Review Teacher Requests</a>
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">This is an automated notification from ${escapeHtml(PLATFORM_NAME)}.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: adminEmail, subject, html });
};

/**
 * Send admin notification about new payment request
 * @param {string} adminEmail - Admin email address
 * @param {Object} payment - Payment object with amount, currency, paymentMethod, transactionId, paymentReferenceId, manualTransactionId, and createdAt
 * @param {Object} student - Student object with name and email
 * @param {Object} course - Course object with title
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendAdminNewPaymentNotification = async (adminEmail, payment, student, course) => {
  console.log(`📧 [EMAIL SERVICE] Preparing admin payment notification email for: ${adminEmail}`);

  const subject = `New Payment Request - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">New Payment Request</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">A new payment request has been submitted and requires verification:</p>
                  
                  <!-- Payment Details -->
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Student:</strong> ${escapeHtml(student.name)} (${escapeHtml(student.email)})</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Course:</strong> ${escapeHtml(course.title)}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Amount:</strong> NPR ${escapeHtml(String(payment.amount))}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Payment Method:</strong> ${escapeHtml(payment.paymentMethod)}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Transaction ID:</strong> ${escapeHtml(payment.manualTransactionId || payment.transactionId || 'N/A')}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Reference ID:</strong> ${escapeHtml(payment.paymentReferenceId)}</p>
                    <p style="margin: 0; font-size: 16px; color: #333;"><strong>Submitted:</strong> ${payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  
                  <!-- Action Required Alert -->
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404; font-weight: bold;">⚠️ Action Required: Please verify this payment and approve or reject it.</p>
                  </div>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${process.env.CLIENT_URL || process.env.FRONTEND_URL}/admin/payments" style="display: inline-block; padding: 14px 32px; background-color: #f5576c; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Review Payment Requests</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">This is an automated notification from ${escapeHtml(PLATFORM_NAME)}.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: adminEmail, subject, html });
};

/**
 * Send teacher approval notification (used by adminController)
 * @param {Object} teacher - Teacher object with name and email
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendTeacherApprovalNotification = async (teacher) => {
  console.log(`📧 [EMAIL SERVICE] Preparing teacher approval notification email for: ${teacher.email}`);

  const { name, email } = teacher;

  const subject = `Teacher Account Approved - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Teacher Account Approved! 🎉</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hello ${escapeHtml(name)},</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Great news! Your request to become a teacher on ${escapeHtml(PLATFORM_NAME)} has been approved.</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">You can now:</p>
                  <ul style="margin: 20px 0; padding-left: 20px; color: #555;">
                    <li>Create and manage courses</li>
                    <li>Upload videos and materials</li>
                    <li>Create quizzes and assignments</li>
                    <li>View student progress and certificates</li>
                  </ul>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${process.env.CLIENT_URL || process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 14px 32px; background-color: #11998e; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Login to Your Account</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">Welcome to the teaching team! We're excited to have you on board.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send admin notification about new counselling request
 * @param {string} adminEmail - Admin email address
 * @param {Object} lead - CounsellingLead object with name, phone, institution, and createdAt
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendAdminCounsellingRequestNotification = async (adminEmail, lead) => {
  console.log(`📧 [EMAIL SERVICE] Preparing admin counselling notification email for: ${adminEmail}`);

  const subject = `New Counselling Request - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">New Counselling Request</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">A new career counselling request has been submitted on ${escapeHtml(PLATFORM_NAME)}:</p>
                  
                  <!-- Lead Details -->
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;"><strong>Institution:</strong> ${escapeHtml(lead.institution)}</p>
                    <p style="margin: 0; font-size: 16px; color: #333;"><strong>Submitted:</strong> ${lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  
                  <!-- Action Required Alert -->
                  <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #0c5460; font-weight: bold;">📞 Action Required: Please contact the requester to provide career counselling guidance.</p>
                  </div>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${CLIENT_URL}/admin/counselling" style="display: inline-block; padding: 14px 32px; background-color: #4facfe; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Counselling Requests</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">This is an automated notification from ${escapeHtml(PLATFORM_NAME)}.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: adminEmail, subject, html });
};

/**
 * Send teacher rejection notification (used by adminController)
 * @param {Object} teacher - Teacher object with name and email
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<Object>} - Result from sendEmail
 */
const sendTeacherRejectionNotification = async (teacher, reason) => {
  console.log(`📧 [EMAIL SERVICE] Preparing teacher rejection notification email for: ${teacher.email}`);

  const { name, email } = teacher;

  const subject = `Teacher Account Request - ${PLATFORM_NAME}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Teacher Account Request</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hello ${escapeHtml(name)},</p>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Thank you for your interest in becoming a teacher on ${escapeHtml(PLATFORM_NAME)}.</p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">Unfortunately, your teacher account request has not been approved at this time.</p>
                  
                  ${reason ? `
                    <!-- Reason -->
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>
                    </div>
                  ` : ''}
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #555;">If you believe this is an error or would like to reapply, please contact our support team.</p>
                  
                  <!-- Footer -->
                  <p style="margin: 40px 0 0 0; font-size: 12px; color: #999; text-align: center;">We appreciate your interest in joining our teaching community.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

// Export functions as named exports (for individual imports)
export {
  sendRegistrationConfirmation,
  sendEmailVerification,
  sendPasswordReset,
  sendPaymentApproval,
  sendCertificateCompletion,
  sendAdminNewUserNotification,
  sendAdminNewPaymentNotification,
  sendAdminCounsellingRequestNotification,
  sendTeacherApprovalNotification,
  sendTeacherRejectionNotification,
};

// Export all email template functions as default export
export default {
  sendRegistrationConfirmation,
  sendEmailVerification,
  sendPasswordReset,
  sendPaymentApproval,
  sendCertificateCompletion,
  sendAdminNewUserNotification,
  sendAdminNewPaymentNotification,
  sendAdminCounsellingRequestNotification,
  sendTeacherApprovalNotification,
  sendTeacherRejectionNotification,
};
