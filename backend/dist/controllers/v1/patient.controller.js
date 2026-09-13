"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientById = exports.cancelAppointment = exports.rescheduleAppointment = exports.getMyOrders = exports.verifyServicePayment = exports.createServiceOrder = exports.joinVideoCall = exports.downloadPrescription = exports.downloadToken = exports.getMyAppointments = void 0;
const database_1 = require("../../config/database.js");
const AppError_1 = require("../../errors/AppError.js");
const errorCodes_1 = require("../../errors/errorCodes.js");
const constants_1 = require("../../utilities/constants.js");
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
const pdf_1 = require("../../utilities/pdf.js");
const settings_1 = require("../../utilities/settings.js");
const livekit_server_sdk_1 = require("livekit-server-sdk");
/**
 * Fetch all appointments for the logged-in patient
 */
exports.getMyAppointments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.id;
    const appointments = await database_1.prisma.appointment.findMany({
        where: { patientId },
        include: {
            doctor: { select: { id: true, name: true, specialization: true } },
            branch: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { appointments } });
});
/**
 * Download Booking Token Pass as PDF
 */
exports.downloadToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.id;
    const { id } = req.params;
    const appointment = await database_1.prisma.appointment.findFirst({
        where: { id, patientId },
        include: { patient: true, doctor: true, branch: true }
    });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    // Pipes the PDF to response
    (0, pdf_1.generateTokenPDF)(appointment, res);
});
/**
 * Download Prescription as PDF
 */
exports.downloadPrescription = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.id;
    const { id } = req.params;
    const appointment = await database_1.prisma.appointment.findFirst({
        where: { id, patientId },
        include: { patient: true, doctor: true, branch: true }
    });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    // Pipes the PDF to response
    (0, pdf_1.generatePrescriptionPDF)(appointment, res);
});
/**
 * Generate a LiveKit Token for the Patient to join the Video Room
 */
exports.joinVideoCall = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.id;
    const { id } = req.params;
    const appointment = await database_1.prisma.appointment.findFirst({
        where: { id, patientId, bookingMode: 'VIRTUAL' },
        include: { patient: true }
    });
    if (!appointment)
        throw new AppError_1.AppError('Virtual appointment not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    // Room name must match the one the doctor joins
    const roomName = appointment.id;
    const participantName = appointment.patient.name;
    const at = new livekit_server_sdk_1.AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: patientId, name: participantName });
    // Standard user grant
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        data: {
            token,
            roomName,
            url: process.env.LIVEKIT_URL
        }
    });
});
// ─────────────────────────────────────────────
// Care Service Orders (Pharmacy, Diagnostics, Lab)
// ─────────────────────────────────────────────
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});
/**
 * Creates an order for a Care Service and initializes Razorpay
 */
exports.createServiceOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.id;
    const { serviceId, couponCode, useWalletBalance } = req.body;
    if (!serviceId)
        throw new AppError_1.AppError('Service ID is required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    const service = await database_1.prisma.careService.findFirst({ where: { id: serviceId, isActive: true } });
    if (!service)
        throw new AppError_1.AppError('Service not available', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    let finalAmount = service.price;
    // Apply Coupon
    if (couponCode) {
        const coupon = await database_1.prisma.coupon.findFirst({
            where: { code: couponCode, userId: patientId, isUsed: false, isActive: true, expiresAt: { gt: new Date() } }
        });
        if (coupon) {
            if (coupon.discountType === 'PERCENTAGE') {
                finalAmount = finalAmount - (finalAmount * (coupon.discountValue / 100));
            }
            else {
                finalAmount = Math.max(0, finalAmount - coupon.discountValue);
            }
            await database_1.prisma.coupon.update({ where: { id: coupon.id }, data: { isUsed: true } });
        }
    }
    // Apply Wallet
    if (useWalletBalance) {
        const patientUser = await database_1.prisma.user.findUnique({ where: { id: patientId } });
        if (patientUser && patientUser.walletBalance > 0) {
            if (patientUser.walletBalance >= finalAmount) {
                await database_1.prisma.user.update({ where: { id: patientId }, data: { walletBalance: { decrement: finalAmount } } });
                finalAmount = 0;
            }
            else {
                finalAmount = finalAmount - patientUser.walletBalance;
                await database_1.prisma.user.update({ where: { id: patientId }, data: { walletBalance: 0 } });
            }
        }
    }
    // Calculate platform fee
    let platformFee = 0;
    if (finalAmount > 0) {
        let rateKey = 'COMMISSION_RATE_PHARMACY';
        if (service.category === 'DIAGNOSTICS')
            rateKey = 'COMMISSION_RATE_DIAGNOSTICS';
        else if (service.category === 'LABORATORY')
            rateKey = 'COMMISSION_RATE_LABORATORY';
        const commissionRate = Number(await (0, settings_1.getSystemSetting)(rateKey, 10));
        platformFee = (finalAmount * commissionRate) / 100;
    }
    // Save the ServiceOrder to the database
    const order = await database_1.prisma.serviceOrder.create({
        data: {
            patientId,
            serviceId,
            amount: finalAmount,
            platformFee,
            status: finalAmount === 0 ? 'PAID' : 'PENDING'
        }
    });
    // Create the Razorpay Order if there's an amount left to pay
    let razorpayOrderId = null;
    if (finalAmount > 0) {
        const options = {
            amount: finalAmount * 100, // paise
            currency: 'INR',
            receipt: `receipt_care_${order.id}`
        };
        razorpayOrderId = `dummy_order_${Math.floor(Math.random() * 1000000)}`;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'dummy_key_id') {
            try {
                const rpOrder = await razorpay.orders.create(options);
                razorpayOrderId = rpOrder.id;
            }
            catch (err) {
                console.error('Razorpay API failed (likely invalid keys). Using dummy order ID instead.', err);
            }
        }
        await database_1.prisma.serviceOrder.update({
            where: { id: order.id },
            data: { razorpayOrderId }
        });
    }
    res.status(constants_1.HTTP_STATUS.CREATED).json({
        status: 'success',
        data: {
            order,
            razorpayOrderId,
            amount: finalAmount,
            currency: 'INR'
        }
    });
});
/**
 * Verify Razorpay payment for the ServiceOrder
 */
exports.verifyServicePayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new AppError_1.AppError('Incomplete payment details', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const order = await database_1.prisma.serviceOrder.findFirst({ where: { razorpayOrderId, patientId } });
    if (!order)
        throw new AppError_1.AppError('Order not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    // Verify Signature
    const generatedSignature = crypto_1.default
        .createHmac('sha256', secret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
    if (generatedSignature !== razorpaySignature) {
        throw new AppError_1.AppError('Invalid payment signature', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    // Update order status
    const updatedOrder = await database_1.prisma.serviceOrder.update({
        where: { id: order.id },
        data: {
            status: 'PAID',
            razorpayPaymentId
        },
        include: {
            service: true
        }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Payment verified successfully',
        data: { order: updatedOrder }
    });
});
/**
 * Fetch patient's order history
 */
exports.getMyOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.id;
    const orders = await database_1.prisma.serviceOrder.findMany({
        where: { patientId },
        include: {
            service: {
                include: {
                    doctor: { select: { id: true, name: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { orders } });
});
// ─────────────────────────────────────────────
// Advanced Patient Features
// ─────────────────────────────────────────────
/**
 * Reschedule an Appointment (Patient / Doctor / Admin / Staff)
 */
exports.rescheduleAppointment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;
    const { appointmentDate, timeSlot } = req.body;
    if (!appointmentDate || !timeSlot) {
        throw new AppError_1.AppError('New date and time slot are required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const whereClause = { id };
    if (userRole === constants_1.USER_ROLES.PATIENT) {
        whereClause.patientId = userId;
    }
    else if (userRole === constants_1.USER_ROLES.DOCTOR) {
        whereClause.doctorId = userId;
    }
    const appointment = await database_1.prisma.appointment.findFirst({ where: whereClause });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found or unauthorized', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
        throw new AppError_1.AppError('Cannot reschedule a completed or cancelled appointment', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const updatedAppointment = await database_1.prisma.appointment.update({
        where: { id },
        data: {
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            isRescheduled: true,
        }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Appointment rescheduled successfully',
        data: { appointment: updatedAppointment }
    });
});
/**
 * Cancel an Appointment (Patient / Doctor / Admin / Staff)
 */
exports.cancelAppointment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;
    const whereClause = { id };
    if (userRole === constants_1.USER_ROLES.PATIENT) {
        whereClause.patientId = userId;
    }
    else if (userRole === constants_1.USER_ROLES.DOCTOR) {
        whereClause.doctorId = userId;
    }
    const appointment = await database_1.prisma.appointment.findFirst({ where: whereClause });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found or unauthorized', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    if (appointment.status === 'COMPLETED') {
        throw new AppError_1.AppError('Cannot cancel a completed appointment', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const updatedAppointment = await database_1.prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Appointment cancelled successfully',
        data: { appointment: updatedAppointment }
    });
});
/**
 * Fetch patient details quickly using their patientId (e.g., PT-10024)
 * (Often used by staff or public interfaces to link details rapidly)
 */
exports.getPatientById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { patientId } = req.params; // Custom ID like PT-10024
    const patient = await database_1.prisma.user.findUnique({
        where: { patientId },
        select: { id: true, patientId: true, name: true, phone: true, age: true, role: true }
    });
    if (!patient || patient.role !== constants_1.USER_ROLES.PATIENT) {
        throw new AppError_1.AppError('Patient not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    }
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { patient } });
});
//# sourceMappingURL=patient.controller.js.map