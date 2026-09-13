"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.bookAppointment = void 0;
const database_1 = require("../../config/database.js");
const AppError_1 = require("../../errors/AppError.js");
const errorCodes_1 = require("../../errors/errorCodes.js");
const constants_1 = require("../../utilities/constants.js");
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
const upload_1 = require("../../utilities/upload.js");
const settings_1 = require("../../utilities/settings.js");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
// Initialize Razorpay
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});
/**
 * Book an Appointment
 */
exports.bookAppointment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { doctorId, branchId, bookingMode, appointmentDate, timeSlot, symptoms, medicalConcerns, couponCode, useWalletBalance, paymentMode } = req.body;
    const patientId = req.user.id;
    if (!doctorId || !bookingMode || !appointmentDate || !timeSlot || !symptoms || !paymentMode) {
        throw new AppError_1.AppError('Missing required booking details (including paymentMode)', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    if (paymentMode !== 'CASH' && paymentMode !== 'ONLINE') {
        throw new AppError_1.AppError('Invalid paymentMode. Must be CASH or ONLINE', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    if (bookingMode === 'VIRTUAL' && paymentMode === 'CASH') {
        throw new AppError_1.AppError('Virtual appointments require ONLINE payment', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    // Verify Doctor
    const doctor = await database_1.prisma.user.findFirst({
        where: { id: doctorId, role: constants_1.USER_ROLES.DOCTOR, isActive: true },
    });
    if (!doctor)
        throw new AppError_1.AppError('Doctor not found or inactive', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    // Determine Fee based on mode
    let fee = bookingMode === 'VIRTUAL' ? doctor.videoFee : doctor.consultationFee;
    if (fee === undefined || fee === null)
        throw new AppError_1.AppError('Fee not defined for this mode', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    // Auto-Calculate Patient Classification
    let calculatedClassification = 'NEW';
    const previousAppts = await database_1.prisma.appointment.findMany({
        where: {
            patientId,
            doctorId,
            status: 'COMPLETED'
        },
        take: 1
    });
    if (previousAppts.length > 0) {
        calculatedClassification = 'EXISTING';
    }
    const followUpWindowStart = new Date();
    followUpWindowStart.setDate(followUpWindowStart.getDate() - 10);
    const recentCompletedAppointment = await database_1.prisma.appointment.findFirst({
        where: {
            patientId,
            doctorId,
            status: 'COMPLETED',
            appointmentDate: { gte: followUpWindowStart },
        },
        orderBy: { appointmentDate: 'desc' },
    });
    if (recentCompletedAppointment) {
        calculatedClassification = 'FOLLOW_UP';
        fee = 0;
    }
    // Apply Coupon
    if (couponCode) {
        const coupon = await database_1.prisma.coupon.findFirst({
            where: { code: couponCode, userId: patientId, isUsed: false, isActive: true, expiresAt: { gt: new Date() } }
        });
        if (coupon) {
            if (coupon.discountType === 'PERCENTAGE') {
                fee = fee - (fee * (coupon.discountValue / 100));
            }
            else {
                fee = Math.max(0, fee - coupon.discountValue);
            }
            await database_1.prisma.coupon.update({ where: { id: coupon.id }, data: { isUsed: true } });
        }
    }
    // Apply Wallet
    if (useWalletBalance) {
        const patientUser = await database_1.prisma.user.findUnique({ where: { id: patientId } });
        if (patientUser && patientUser.walletBalance > 0) {
            if (patientUser.walletBalance >= fee) {
                await database_1.prisma.user.update({ where: { id: patientId }, data: { walletBalance: { decrement: fee } } });
                fee = 0;
            }
            else {
                fee = fee - patientUser.walletBalance;
                await database_1.prisma.user.update({ where: { id: patientId }, data: { walletBalance: 0 } });
            }
        }
    }
    const parsedSymptoms = typeof symptoms === 'string' ? JSON.parse(symptoms) : symptoms;
    // Handle Document and Voice Note Uploads
    const documents = [];
    let voiceNoteUrl = null;
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        // Process Documents
        if (req.files['documents']) {
            for (const file of req.files['documents']) {
                try {
                    const url = await (0, upload_1.uploadToR2)(file.buffer, file.originalname, file.mimetype);
                    documents.push(url);
                }
                catch (err) {
                    console.error('File upload failed, skipping file', err);
                }
            }
        }
        // Process Voice Note
        if (req.files['voiceNote'] && req.files['voiceNote'].length > 0) {
            try {
                const file = req.files['voiceNote'][0];
                voiceNoteUrl = await (0, upload_1.uploadToR2)(file.buffer, file.originalname, file.mimetype);
            }
            catch (err) {
                console.error('Voice note upload failed', err);
            }
        }
    }
    let tokenNumber = null;
    if (bookingMode === 'PHYSICAL') {
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        const count = await database_1.prisma.appointment.count({
            where: {
                doctorId,
                appointmentDate: { gte: startOfDay, lt: endOfDay },
                bookingMode: 'PHYSICAL',
            }
        });
        tokenNumber = count + 1; // Sequential token
    }
    // Calculate Platform Commission (Only if fee > 0)
    let platformFee = 0;
    if (fee > 0) {
        const doctorCommissionRate = Number(await (0, settings_1.getSystemSetting)('COMMISSION_RATE_DOCTOR', 10));
        platformFee = (fee * doctorCommissionRate) / 100;
    }
    // Resolve valid Branch ID from Database (supports ID, name, or city slug)
    let validBranchId = null;
    if (branchId) {
        const existingBranch = await database_1.prisma.branch.findFirst({
            where: {
                OR: [
                    { id: branchId },
                    { name: { equals: branchId, mode: 'insensitive' } },
                    { title: { contains: branchId, mode: 'insensitive' } },
                    { city: { equals: branchId, mode: 'insensitive' } }
                ]
            }
        });
        if (existingBranch) {
            validBranchId = existingBranch.id;
        }
    }
    if (!validBranchId && bookingMode === 'PHYSICAL') {
        const firstBranch = await database_1.prisma.branch.findFirst();
        if (firstBranch) {
            validBranchId = firstBranch.id;
        }
    }
    // Create Appointment
    const appointment = await database_1.prisma.appointment.create({
        data: {
            patientId,
            doctorId,
            branchId: validBranchId,
            bookingMode,
            patientClassification: calculatedClassification,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            symptoms: parsedSymptoms,
            medicalConcerns,
            documents,
            voiceNoteUrl,
            status: (paymentMode === 'CASH' || (paymentMode === 'ONLINE' && fee === 0)) ? 'CONFIRMED' : 'PENDING',
            paymentMode,
            paymentStatus: (fee === 0) ? 'PAID' : 'PENDING',
            fee,
            platformFee,
            tokenNumber,
        }
    });
    // If ONLINE (Razorpay) and fee > 0
    if (paymentMode === 'ONLINE' && fee > 0) {
        const options = {
            amount: fee * 100, // in paise
            currency: 'INR',
            receipt: appointment.id,
        };
        let razorpayOrderId = `dummy_order_${Math.floor(Math.random() * 1000000)}`;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'dummy_key_id') {
            try {
                const order = await razorpay.orders.create(options);
                razorpayOrderId = order.id;
            }
            catch (err) {
                console.error('Razorpay API failed (likely invalid keys). Using dummy order ID instead.', err);
            }
        }
        await database_1.prisma.appointment.update({
            where: { id: appointment.id },
            data: { razorpayOrderId }
        });
        return res.status(constants_1.HTTP_STATUS.CREATED).json({
            status: 'success',
            data: {
                appointment,
                razorpayOrderId,
                amount: options.amount,
                currency: options.currency,
            }
        });
    }
    // If CASH (Physical)
    return res.status(constants_1.HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Appointment confirmed successfully',
        data: { appointment }
    });
});
/**
 * Verify Razorpay Payment Signature
 */
exports.verifyPayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { appointmentId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!appointmentId || !razorpayPaymentId || !razorpaySignature) {
        throw new AppError_1.AppError('Missing payment verification details', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const appointment = await database_1.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || !appointment.razorpayOrderId) {
        throw new AppError_1.AppError('Invalid appointment or missing order ID', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    // Verify Signature
    const generatedSignature = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(appointment.razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
    if (generatedSignature !== razorpaySignature) {
        throw new AppError_1.AppError('Invalid payment signature', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    // Payment is valid
    const updatedAppointment = await database_1.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            razorpayPaymentId,
        }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Payment verified and appointment confirmed',
        data: { appointment: updatedAppointment }
    });
});
//# sourceMappingURL=appointment.controller.js.map