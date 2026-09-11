const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Formats a numeric OTP into spaced characters e.g. "7 7 0 2 9 5"
 */
const formatOTP = (otp: string): string => {
  return String(otp).trim().split('').join(' ');
};

/**
 * Base Wrapper for SevaArogyam HTML Emails
 */
const renderEmailWrapper = (headerSubtitle: string, contentHTML: string, subHeaderBannerHTML?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SevaArogyam Healthcare</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0d9488; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.5px;">SevaArogyam</h1>
              <p style="color: rgba(255, 255, 255, 0.85); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; margin: 0;">${headerSubtitle}</p>
            </td>
          </tr>

          ${subHeaderBannerHTML ? `
          <!-- Optional Banner Bar Below Header -->
          <tr>
            <td>
              ${subHeaderBannerHTML}
            </td>
          </tr>
          ` : ''}

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              ${contentHTML}
              
              <!-- Footer Divider -->
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0 20px 0;" />

              <!-- Footer -->
              <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.6; margin: 0 0 6px 0;">
                This is an automated message from SevaArogyam. Please do not reply to this email.
              </p>
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                © 2026 SevaArogyam Healthcare Platform · All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * 1. Admin Login OTP Email
 */
export const getAdminOTPEmailHTML = (otp: string): string => {
  const formattedOTP = formatOTP(otp);
  const subHeaderBanner = `
    <div style="background-color: #fffbe6; border-top: 1px solid #ffe58f; border-bottom: 1px solid #ffe58f; padding: 10px 16px; text-align: center;">
      <p style="color: #92400e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
        🔒 RESTRICTED ACCESS · ADMINISTRATOR LOGIN
      </p>
    </div>
  `;

  const content = `
    <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-align: left;">Admin Login Verification</h2>
    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: left;">
      A sign-in attempt was made to the SevaArogyam Admin Console. Use the code below to verify it's you.
    </p>

    <!-- OTP Box -->
    <div style="background-color: #e6f4f1; border: 2px dashed #0d9488; border-radius: 16px; padding: 24px 16px; text-align: center; margin-bottom: 20px;">
      <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">YOUR ADMIN OTP</p>
      <p style="color: #0d9488; font-size: 34px; font-weight: 900; font-family: 'Courier New', Courier, monospace; letter-spacing: 10px; margin: 0; padding-left: 10px;">
        ${formattedOTP}
      </p>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0; text-align: left;">
      This code is valid for <strong>10 minutes</strong> and can be used only once.
    </p>

    <!-- Warning Alert Box -->
    <div style="background-color: #fff1f2; border-radius: 14px; padding: 16px; text-align: left;">
      <p style="color: #9f1239; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 500;">
        ⚠️ If you did not attempt to log in, please secure your account immediately and contact IT/Support.
      </p>
    </div>
  `;

  return renderEmailWrapper('ADMIN PORTAL', content, subHeaderBanner);
};

/**
 * 2. Patient Login OTP Email
 */
export const getPatientOTPEmailHTML = (otp: string): string => {
  const formattedOTP = formatOTP(otp);

  const content = `
    <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-align: left;">Verify Your Login</h2>
    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: left;">
      Hi there 👋 Use the One-Time Password below to securely log in to your SevaArogyam account.
    </p>

    <!-- OTP Box -->
    <div style="background-color: #e6f4f1; border: 2px dashed #0d9488; border-radius: 16px; padding: 24px 16px; text-align: center; margin-bottom: 20px;">
      <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">YOUR OTP CODE</p>
      <p style="color: #0d9488; font-size: 34px; font-weight: 900; font-family: 'Courier New', Courier, monospace; letter-spacing: 10px; margin: 0; padding-left: 10px;">
        ${formattedOTP}
      </p>
    </div>

    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0; text-align: left;">
      This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone, including SevaArogyam staff.
    </p>

    <!-- Warning Alert Box -->
    <div style="background-color: #fff1f2; border-radius: 14px; padding: 16px; text-align: left;">
      <p style="color: #9f1239; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 500;">
        ⚠️ Didn't request this? You can safely ignore this email — no changes were made to your account.
      </p>
    </div>
  `;

  return renderEmailWrapper('YOUR HEALTH, SIMPLIFIED', content);
};

/**
 * 3. Doctor Creation Credentials Email
 */
export const getDoctorCredentialsEmailHTML = (name: string, email: string, rawPassword: string): string => {
  const content = `
    <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-align: left;">Welcome, Dr. ${name} 🧑‍⚕️</h2>
    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: left;">
      An administrator has created your doctor account on the SevaArogyam Portal. Your login credentials are below.
    </p>

    <!-- Credentials Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 24px; text-align: left;">
      <div style="padding: 16px 20px;">
        <p style="color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">LOGIN EMAIL</p>
        <p style="color: #0f172a; font-size: 15px; font-weight: 700; margin: 0; word-break: break-all;">${email}</p>
      </div>
      
      <div style="height: 1px; background-color: #e2e8f0;"></div>
      
      <div style="padding: 16px 20px;">
        <p style="color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">TEMPORARY PASSWORD</p>
        <p style="color: #0f172a; font-size: 16px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 1px; margin: 0;">${rawPassword}</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 24px 0 28px 0;">
      <a href="${FRONTEND_URL}/login" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
        Log In to SevaArogyam
      </a>
    </div>

    <!-- Security Warning Box -->
    <div style="background-color: #fff1f2; border-radius: 14px; padding: 16px; text-align: left; margin-bottom: 16px;">
      <p style="color: #9f1239; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 500;">
        🔐 For your security, please log in and change this temporary password as soon as possible.
      </p>
    </div>

    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
      Need help? Contact your platform administrator.
    </p>
  `;

  return renderEmailWrapper('DOCTOR PORTAL', content);
};

/**
 * 4. Staff Creation Credentials Email
 */
export const getStaffCredentialsEmailHTML = (name: string, email: string, rawPassword: string): string => {
  const content = `
    <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-align: left;">Welcome, ${name} 🧑‍⚕️</h2>
    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: left;">
      An administrator has created your staff account on the SevaArogyam Portal. Your login credentials are below.
    </p>

    <!-- Credentials Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 24px; text-align: left;">
      <div style="padding: 16px 20px;">
        <p style="color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">LOGIN EMAIL</p>
        <p style="color: #0f172a; font-size: 15px; font-weight: 700; margin: 0; word-break: break-all;">${email}</p>
      </div>
      
      <div style="height: 1px; background-color: #e2e8f0;"></div>
      
      <div style="padding: 16px 20px;">
        <p style="color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">TEMPORARY PASSWORD</p>
        <p style="color: #0f172a; font-size: 16px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 1px; margin: 0;">${rawPassword}</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 24px 0 28px 0;">
      <a href="${FRONTEND_URL}/login" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
        Log In to SevaArogyam
      </a>
    </div>

    <!-- Security Warning Box -->
    <div style="background-color: #fff1f2; border-radius: 14px; padding: 16px; text-align: left; margin-bottom: 16px;">
      <p style="color: #9f1239; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 500;">
        🔐 For your security, please log in and change this temporary password as soon as possible.
      </p>
    </div>

    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
      Need help? Contact your platform administrator.
    </p>
  `;

  return renderEmailWrapper('STAFF PORTAL', content);
};

/**
 * 5. Forgot Password Email
 */
export const getForgotPasswordEmailHTML = (resetURL: string): string => {
  const content = `
    <!-- Key Badge Icon -->
    <div style="width: 56px; height: 56px; background-color: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; text-align: center; line-height: 56px;">
      <span style="font-size: 28px;">🔑</span>
    </div>

    <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-align: center;">Reset Your Password</h2>
    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
      We received a request to reset the password for your SevaArogyam account. Click the button below to set a new one.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 24px 0 20px 0;">
      <a href="${resetURL}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
        Reset Password
      </a>
    </div>

    <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0 0 24px 0;">
      This link will expire in <strong>30 minutes</strong> for your security.
    </p>

    <!-- Warning Alert Box -->
    <div style="background-color: #fff1f2; border-radius: 14px; padding: 16px; text-align: left;">
      <p style="color: #9f1239; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 500;">
        ⚠️ Didn't request this? You can safely ignore this email — your password will remain unchanged.
      </p>
    </div>
  `;

  return renderEmailWrapper('ACCOUNT SECURITY', content);
};
