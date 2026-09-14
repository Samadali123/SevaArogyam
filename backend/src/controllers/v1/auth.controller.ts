import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS, USER_ROLES, JWT } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';
import { getSystemSetting } from '@utilities/settings';
import { comparePassword, generateTokens, generateOTP, generateResetToken, hashPassword } from '@utilities/auth';
import { sendEmail } from '@utilities/mailer';
import { getAdminOTPEmailHTML, getPatientOTPEmailHTML, getForgotPasswordEmailHTML } from '@utilities/emailTemplates';

// ─────────────────────────────────────────────
// Admin / Doctor / Staff Login (Email + Password)
// ─────────────────────────────────────────────


export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role === USER_ROLES.PATIENT || user.role === USER_ROLES.ADMIN) {
    throw new AppError(
      user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.PATIENT)
        ? 'Admins and Patients must log in using OTP'
        : 'Invalid credentials or unauthorized role',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED,
      true
    );
  }

  if (!user.isActive) {
    throw new AppError('Your account is inactive. Please contact admin.', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true);
  }

  if (!user.password) {
    throw new AppError('Account not fully setup.', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true);
  }

  const isPasswordCorrect = await comparePassword(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, true);
  }

  // Generate tokens
  const tokens = generateTokens({ id: user.id, role: user.role });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    },
  });
});

// ─────────────────────────────────────────────
// Admin & Patient Login/Registration (OTP via Email)
// ─────────────────────────────────────────────
export const sendAdminOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + JWT.OTP_EXPIRES_MINS * 60 * 1000);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { otp, otpExpiry, role: USER_ROLES.ADMIN },
    create: {
      email,
      name: 'Admin',
      role: USER_ROLES.ADMIN,
      otp,
      otpExpiry,
    }
  });

  if (!user.isActive) throw new AppError('Account is inactive', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true);
  console.log(`[AUTH] Admin OTP generated for ${user.email}: ${otp}`);
  await sendEmail(user.email!, 'SevaArogyam Admin Login Verification Code', getAdminOTPEmailHTML(otp));
  
  res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'OTP sent to admin email.' });
});

export const verifyAdminOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new AppError('Email and OTP are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  
  const user = await prisma.user.findFirst({ where: { email, otp, role: USER_ROLES.ADMIN } });
  if (!user) throw new AppError('Invalid OTP or Admin not found', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, true);
  if (user.otpExpiry && user.otpExpiry < new Date()) throw new AppError('OTP expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, true);

  await prisma.user.update({ where: { id: user.id }, data: { otp: null, otpExpiry: null } });
  const tokens = generateTokens({ id: user.id, role: user.role });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens } });
});

export const sendPatientOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body; 
  if (!email) throw new AppError('Email is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.role !== USER_ROLES.PATIENT) {
    throw new AppError('This email is registered for another role', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }
  
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + JWT.OTP_EXPIRES_MINS * 60 * 1000);
  const patientIdGen = `PT-${Math.floor(10000 + Math.random() * 90000)}`;

  const user = await prisma.user.upsert({
    where: { email },
    update: { otp, otpExpiry },
    create: { email, name: 'Patient', role: USER_ROLES.PATIENT, patientId: patientIdGen, otp, otpExpiry },
  });

  console.log(`[AUTH] Patient OTP generated for ${user.email}: ${otp}`);
  await sendEmail(user.email!, 'SevaArogyam Login Verification Code', getPatientOTPEmailHTML(otp));
  res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'OTP sent to email.' });
});

export const verifyPatientOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, referralCode } = req.body;
  if (!email || !otp) throw new AppError('Email and OTP are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  
  let user = await prisma.user.findFirst({ where: { email, otp, role: USER_ROLES.PATIENT } });
  if (!user) throw new AppError('Invalid OTP', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, true);
  if (user.otpExpiry && user.otpExpiry < new Date()) throw new AppError('OTP expired', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, true);

  user = await prisma.user.update({ where: { id: user.id }, data: { otp: null, otpExpiry: null } });

  if (referralCode && !user.referredById) {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (referrer && referrer.id !== user.id) {
      user = await prisma.user.update({ where: { id: user.id }, data: { referredById: referrer.id } });
      const referralBonusAmount = Number(await getSystemSetting('REFERRAL_BONUS_AMOUNT', 150));
      await prisma.user.update({ where: { id: referrer.id }, data: { walletBalance: { increment: referralBonusAmount } } });
      const referralDiscountPercent = Number(await getSystemSetting('REFERRAL_DISCOUNT_PERCENT', 5));
      const expirationDate = new Date(); expirationDate.setDate(expirationDate.getDate() + 30);
      await prisma.coupon.create({ data: { code: `WELCOME-${user.id.substring(0, 5).toUpperCase()}`, discountType: 'PERCENTAGE', discountValue: referralDiscountPercent, userId: user.id, expiresAt: expirationDate } });
    }
  }

  const tokens = generateTokens({ id: user.id, role: user.role });
  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens } });
});





// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
export const logout = asyncHandler(async (_req: Request, res: Response) => {

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// ─────────────────────────────────────────────
// Forgot Password (Doctor / Staff)
// ─────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide your email', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role === USER_ROLES.PATIENT) {
    throw new AppError('User not found or role logs in via OTP', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  const resetToken = generateResetToken();
  const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  sendEmail(user.email!, 'SevaArogyam Password Reset Request', getForgotPasswordEmailHTML(resetURL)).catch(err => console.error('[AUTH] Forgot password email error:', err));

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Password reset link sent to email',
  });
});

// ─────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    throw new AppError('Please provide token in URL and both passwords in body', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('Passwords do not match', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  const tokens = generateTokens({ id: user.id, role: user.role });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Password updated successfully.',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    },
  });
});
