import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS, USER_ROLES } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';
import { generatePrescriptionPDF, generateTokenPDF } from '@utilities/pdf';
import { getSystemSetting } from '@utilities/settings';
import { AccessToken } from 'livekit-server-sdk';

/**
 * Fetch all appointments for the logged-in patient
 */
export const getMyAppointments = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user!.id;

  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: { select: { id: true, name: true, specialization: true } },
      branch: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { appointments } });
});

/**
 * Download Booking Token Pass as PDF
 */
export const downloadToken = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user!.id;
  const { id } = req.params;

  const appointment = await prisma.appointment.findFirst({ 
    where: { id, patientId },
    include: { patient: true, doctor: true, branch: true }
  });
  
  if (!appointment) throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  // Pipes the PDF to response
  generateTokenPDF(appointment, res);
});

/**
 * Download Prescription as PDF
 */
export const downloadPrescription = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user!.id;
  const { id } = req.params;

  const appointment = await prisma.appointment.findFirst({ 
    where: { id, patientId },
    include: { patient: true, doctor: true, branch: true }
  });
  
  if (!appointment) throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  // Pipes the PDF to response
  generatePrescriptionPDF(appointment, res);
});

/**
 * Generate a LiveKit Token for the Patient to join the Video Room
 */
export const joinVideoCall = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user!.id;
  const { id } = req.params;

  const appointment = await prisma.appointment.findFirst({
    where: { id, patientId, bookingMode: 'VIRTUAL' },
    include: { patient: true }
  });

  if (!appointment) throw new AppError('Virtual appointment not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  // Room name must match the one the doctor joins
  const roomName = appointment.id;
  const participantName = appointment.patient.name;

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: patientId, name: participantName }
  );

  // Standard user grant
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();

  res.status(HTTP_STATUS.OK).json({ 
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

import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

/**
 * Creates an order for a Care Service and initializes Razorpay
 */
export const createServiceOrder = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user!.id;
  const { serviceId, couponCode, useWalletBalance } = req.body;

  if (!serviceId) throw new AppError('Service ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);

  const service = await prisma.careService.findFirst({ where: { id: serviceId, isActive: true } });
  if (!service) throw new AppError('Service not available', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  let finalAmount = service.price;

  // Apply Coupon
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: couponCode, userId: patientId, isUsed: false, isActive: true, expiresAt: { gt: new Date() } }
    });
    if (coupon) {
      if (coupon.discountType === 'PERCENTAGE') {
        finalAmount = finalAmount - (finalAmount * (coupon.discountValue / 100));
      } else {
        finalAmount = Math.max(0, finalAmount - coupon.discountValue);
      }
      await prisma.coupon.update({ where: { id: coupon.id }, data: { isUsed: true } });
    }
  }

  // Apply Wallet
  if (useWalletBalance) {
    const patientUser = await prisma.user.findUnique({ where: { id: patientId } });
    if (patientUser && patientUser.walletBalance > 0) {
      if (patientUser.walletBalance >= finalAmount) {
        await prisma.user.update({ where: { id: patientId }, data: { walletBalance: { decrement: finalAmount } } });
        finalAmount = 0;
      } else {
        finalAmount = finalAmount - patientUser.walletBalance;
        await prisma.user.update({ where: { id: patientId }, data: { walletBalance: 0 } });
      }
    }
  }

  // Calculate platform fee
  let platformFee = 0;
  if (finalAmount > 0) {
    let rateKey = 'COMMISSION_RATE_PHARMACY';
    if (service.category === 'DIAGNOSTICS') rateKey = 'COMMISSION_RATE_DIAGNOSTICS';
    else if (service.category === 'LABORATORY') rateKey = 'COMMISSION_RATE_LABORATORY';
    
    const commissionRate = Number(await getSystemSetting(rateKey, 10));
    platformFee = (finalAmount * commissionRate) / 100;
  }

  // Save the ServiceOrder to the database
  const order = await prisma.serviceOrder.create({
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
      } catch (err) {
        console.error('Razorpay API failed (likely invalid keys). Using dummy order ID instead.', err);
      }
    }

    await prisma.serviceOrder.update({
      where: { id: order.id },
      data: { razorpayOrderId }
    });
  }

  res.status(HTTP_STATUS.CREATED).json({
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
export const verifyServicePayment = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user!.id;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Incomplete payment details', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const order = await prisma.serviceOrder.findFirst({ where: { razorpayOrderId, patientId } });
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
  
  // Verify Signature
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    throw new AppError('Invalid payment signature', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  // Update order status
  const updatedOrder = await prisma.serviceOrder.update({
    where: { id: order.id },
    data: {
      status: 'PAID',
      razorpayPaymentId
    },
    include: {
      service: true
    }
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Payment verified successfully',
    data: { order: updatedOrder }
  });
});

/**
 * Fetch patient's order history
 */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user!.id;

  const orders = await prisma.serviceOrder.findMany({
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

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { orders } });
});

// ─────────────────────────────────────────────
// Advanced Patient Features
// ─────────────────────────────────────────────

/**
 * Reschedule an Appointment (Patient / Doctor / Admin / Staff)
 */
export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { id } = req.params;
  const { appointmentDate, timeSlot } = req.body;

  if (!appointmentDate || !timeSlot) {
    throw new AppError('New date and time slot are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const whereClause: any = { id };
  if (userRole === USER_ROLES.PATIENT) {
    whereClause.patientId = userId;
  } else if (userRole === USER_ROLES.DOCTOR) {
    whereClause.doctorId = userId;
  }

  const appointment = await prisma.appointment.findFirst({ where: whereClause });

  if (!appointment) throw new AppError('Appointment not found or unauthorized', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
    throw new AppError('Cannot reschedule a completed or cancelled appointment', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: {
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      isRescheduled: true,
    }
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Appointment rescheduled successfully',
    data: { appointment: updatedAppointment }
  });
});

/**
 * Cancel an Appointment (Patient / Doctor / Admin / Staff)
 */
export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { id } = req.params;

  const whereClause: any = { id };
  if (userRole === USER_ROLES.PATIENT) {
    whereClause.patientId = userId;
  } else if (userRole === USER_ROLES.DOCTOR) {
    whereClause.doctorId = userId;
  }

  const appointment = await prisma.appointment.findFirst({ where: whereClause });

  if (!appointment) throw new AppError('Appointment not found or unauthorized', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  if (appointment.status === 'COMPLETED') {
    throw new AppError('Cannot cancel a completed appointment', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' }
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Appointment cancelled successfully',
    data: { appointment: updatedAppointment }
  });
});

/**
 * Fetch patient details quickly using their patientId (e.g., PT-10024)
 * (Often used by staff or public interfaces to link details rapidly)
 */
export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params; // Custom ID like PT-10024

  const patient = await prisma.user.findUnique({
    where: { patientId },
    select: { id: true, patientId: true, name: true, phone: true, age: true, role: true }
  });

  if (!patient || patient.role !== USER_ROLES.PATIENT) {
    throw new AppError('Patient not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { patient } });
});
