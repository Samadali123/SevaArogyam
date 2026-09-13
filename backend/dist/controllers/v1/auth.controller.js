"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.verifyPatientOTP = exports.sendPatientOTP = exports.verifyAdminOTP = exports.sendAdminOTP = exports.login = void 0;
const database_1 = require("@config/database");
const AppError_1 = require("@errors/AppError");
const errorCodes_1 = require("@errors/errorCodes");
const constants_1 = require("@utilities/constants");
const asyncHandler_1 = require("@utilities/asyncHandler");
const settings_1 = require("@utilities/settings");
const auth_1 = require("@utilities/auth");
const mailer_1 = require("@utilities/mailer");
const emailTemplates_1 = require("@utilities/emailTemplates");
// ─────────────────────────────────────────────
// Admin / Doctor / Staff Login (Email + Password)
// ─────────────────────────────────────────────
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError_1.AppError('Please provide email and password', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const user = await database_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user || user.role === constants_1.USER_ROLES.PATIENT || user.role === constants_1.USER_ROLES.ADMIN) {
        throw new AppError_1.AppError(user && (user.role === constants_1.USER_ROLES.ADMIN || user.role === constants_1.USER_ROLES.PATIENT)
            ? 'Admins and Patients must log in using OTP'
            : 'Invalid credentials or unauthorized role', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    }
    if (!user.isActive) {
        throw new AppError_1.AppError('Your account is inactive. Please contact admin.', constants_1.HTTP_STATUS.FORBIDDEN, errorCodes_1.ERROR_CODES.FORBIDDEN, true);
    }
    if (!user.password) {
        throw new AppError_1.AppError('Account not fully setup.', constants_1.HTTP_STATUS.FORBIDDEN, errorCodes_1.ERROR_CODES.FORBIDDEN, true);
    }
    const isPasswordCorrect = await (0, auth_1.comparePassword)(password, user.password);
    if (!isPasswordCorrect) {
        throw new AppError_1.AppError('Invalid credentials', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    }
    // Generate tokens
    const tokens = (0, auth_1.generateTokens)({ id: user.id, role: user.role });
    res.status(constants_1.HTTP_STATUS.OK).json({
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
exports.sendAdminOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new AppError_1.AppError('Email is required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    const otp = (0, auth_1.generateOTP)();
    const otpExpiry = new Date(Date.now() + constants_1.JWT.OTP_EXPIRES_MINS * 60 * 1000);
    const user = await database_1.prisma.user.upsert({
        where: { email },
        update: { otp, otpExpiry, role: constants_1.USER_ROLES.ADMIN },
        create: {
            email,
            name: 'Admin',
            role: constants_1.USER_ROLES.ADMIN,
            otp,
            otpExpiry,
        }
    });
    if (!user.isActive)
        throw new AppError_1.AppError('Account is inactive', constants_1.HTTP_STATUS.FORBIDDEN, errorCodes_1.ERROR_CODES.FORBIDDEN, true);
    console.log(`[AUTH] Admin OTP generated for ${user.email}: ${otp}`);
    await (0, mailer_1.sendEmail)(user.email, 'SevaArogyam Admin Login Verification Code', (0, emailTemplates_1.getAdminOTPEmailHTML)(otp));
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', message: 'OTP sent to admin email.' });
});
exports.verifyAdminOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp)
        throw new AppError_1.AppError('Email and OTP are required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    const user = await database_1.prisma.user.findFirst({ where: { email, otp, role: constants_1.USER_ROLES.ADMIN } });
    if (!user)
        throw new AppError_1.AppError('Invalid OTP or Admin not found', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    if (user.otpExpiry && user.otpExpiry < new Date())
        throw new AppError_1.AppError('OTP expired', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    await database_1.prisma.user.update({ where: { id: user.id }, data: { otp: null, otpExpiry: null } });
    const tokens = (0, auth_1.generateTokens)({ id: user.id, role: user.role });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens } });
});
exports.sendPatientOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email)
        throw new AppError_1.AppError('Email is required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    const existingUser = await database_1.prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.role !== constants_1.USER_ROLES.PATIENT) {
        throw new AppError_1.AppError('This email is registered for another role', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const otp = (0, auth_1.generateOTP)();
    const otpExpiry = new Date(Date.now() + constants_1.JWT.OTP_EXPIRES_MINS * 60 * 1000);
    const patientIdGen = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const user = await database_1.prisma.user.upsert({
        where: { email },
        update: { otp, otpExpiry },
        create: { email, name: 'Patient', role: constants_1.USER_ROLES.PATIENT, patientId: patientIdGen, otp, otpExpiry },
    });
    console.log(`[AUTH] Patient OTP generated for ${user.email}: ${otp}`);
    await (0, mailer_1.sendEmail)(user.email, 'SevaArogyam Login Verification Code', (0, emailTemplates_1.getPatientOTPEmailHTML)(otp));
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', message: 'OTP sent to email.' });
});
exports.verifyPatientOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp, referralCode } = req.body;
    if (!email || !otp)
        throw new AppError_1.AppError('Email and OTP are required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    let user = await database_1.prisma.user.findFirst({ where: { email, otp, role: constants_1.USER_ROLES.PATIENT } });
    if (!user)
        throw new AppError_1.AppError('Invalid OTP', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    if (user.otpExpiry && user.otpExpiry < new Date())
        throw new AppError_1.AppError('OTP expired', constants_1.HTTP_STATUS.UNAUTHORIZED, errorCodes_1.ERROR_CODES.UNAUTHORIZED, true);
    user = await database_1.prisma.user.update({ where: { id: user.id }, data: { otp: null, otpExpiry: null } });
    if (referralCode && !user.referredById) {
        const referrer = await database_1.prisma.user.findUnique({ where: { referralCode } });
        if (referrer && referrer.id !== user.id) {
            user = await database_1.prisma.user.update({ where: { id: user.id }, data: { referredById: referrer.id } });
            const referralBonusAmount = Number(await (0, settings_1.getSystemSetting)('REFERRAL_BONUS_AMOUNT', 150));
            await database_1.prisma.user.update({ where: { id: referrer.id }, data: { walletBalance: { increment: referralBonusAmount } } });
            const referralDiscountPercent = Number(await (0, settings_1.getSystemSetting)('REFERRAL_DISCOUNT_PERCENT', 5));
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
            await database_1.prisma.coupon.create({ data: { code: `WELCOME-${user.id.substring(0, 5).toUpperCase()}`, discountType: 'PERCENTAGE', discountValue: referralDiscountPercent, userId: user.id, expiresAt: expirationDate } });
        }
    }
    const tokens = (0, auth_1.generateTokens)({ id: user.id, role: user.role });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens } });
});
// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
exports.logout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Logged out successfully',
    });
});
// ─────────────────────────────────────────────
// Forgot Password (Doctor / Staff)
// ─────────────────────────────────────────────
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new AppError_1.AppError('Please provide your email', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (!user || user.role === constants_1.USER_ROLES.PATIENT) {
        throw new AppError_1.AppError('User not found or role logs in via OTP', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    }
    const resetToken = (0, auth_1.generateResetToken)();
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
        },
    });
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await (0, mailer_1.sendEmail)(user.email, 'SevaArogyam Password Reset Request', (0, emailTemplates_1.getForgotPasswordEmailHTML)(resetURL));
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Password reset link sent to email',
    });
});
// ─────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
        throw new AppError_1.AppError('Please provide token in URL and both passwords in body', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    if (newPassword !== confirmPassword) {
        throw new AppError_1.AppError('Passwords do not match', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const user = await database_1.prisma.user.findFirst({
        where: {
            passwordResetToken: token,
            passwordResetExpires: { gt: new Date() },
        },
    });
    if (!user) {
        throw new AppError_1.AppError('Token is invalid or has expired', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        },
    });
    const tokens = (0, auth_1.generateTokens)({ id: user.id, role: user.role });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Password updated successfully.',
        data: {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            ...tokens,
        },
    });
});
//# sourceMappingURL=auth.controller.js.map