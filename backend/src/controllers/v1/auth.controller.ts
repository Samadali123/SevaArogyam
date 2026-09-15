import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS, USER_ROLES } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';
import { comparePassword, generateTokens, generateOTP, generateResetToken, hashPassword } from '@utilities/auth';
import { sendEmail } from '@utilities/mailer';
import { getPatientOTPEmailHTML, getForgotPasswordEmailHTML } from '@utilities/emailTemplates';

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

  if (!user || user.role === USER_ROLES.PATIENT) {
    throw new AppError(
      user && user.role === USER_ROLES.PATIENT
        ? 'Patients must log in using OTP'
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
// Single Admin Manual Creation (Developer / Setup API)
// Route: POST /api/v1/auth/create-admin
// ─────────────────────────────────────────────
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  // Enforce Single Admin Constraint
  const existingAdmin = await prisma.user.findFirst({
    where: { role: USER_ROLES.ADMIN }
  });

  if (existingAdmin) {
    throw new AppError('An Admin account already exists. Only 1 Admin is allowed in the system.', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true);
  }

  const existingEmailUser = await prisma.user.findUnique({ where: { email } });
  if (existingEmailUser) {
    throw new AppError('User with this email already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const hashedPassword = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: USER_ROLES.ADMIN,
      isActive: true,
    },
  });

  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    message: 'Admin account created successfully.',
    data: {
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    }
  });
});

// ─────────────────────────────────────────────
// Patient Login/Registration (OTP via Email)
// ─────────────────────────────────────────────
export const sendPatientOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body; 
  if (!email) throw new AppError('Email is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.role !== USER_ROLES.PATIENT) {
    throw new AppError('This email is registered for another role', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }
  
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
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
// Forgot Password (Admin / Doctor / Staff)
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
