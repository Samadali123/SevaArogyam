import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS, USER_ROLES } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';
import { uploadToR2 } from '@utilities/upload';
import { getSystemSetting } from '@utilities/settings';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Book an Appointment
 */
export const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const {
    doctorId, branchId, bookingMode,
    appointmentDate, timeSlot, symptoms, medicalConcerns,
    couponCode, useWalletBalance, paymentMode,
    patientName, patientAge
  } = req.body;

  const patientId = req.user!.id;

  if (!doctorId || !bookingMode || !appointmentDate || !timeSlot || !symptoms || !paymentMode) {
    throw new AppError('Missing required booking details (including paymentMode)', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  // Update patient's actual name & age if provided
  if (patientName && String(patientName).trim() && String(patientName).trim().toLowerCase() !== 'patient') {
    try {
      await prisma.user.update({
        where: { id: patientId },
        data: {
          name: String(patientName).trim(),
          ...(patientAge ? { age: Number(patientAge) } : {})
        }
      });
    } catch (err) {
      console.warn('Could not update patient user details:', err);
    }
  }

  if (paymentMode !== 'CASH' && paymentMode !== 'ONLINE') {
    throw new AppError('Invalid paymentMode. Must be CASH or ONLINE', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  if (bookingMode === 'VIRTUAL' && paymentMode === 'CASH') {
    throw new AppError('Virtual appointments require ONLINE payment', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  // Verify Doctor
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, role: USER_ROLES.DOCTOR, isActive: true },
  });

  if (!doctor) throw new AppError('Doctor not found or inactive', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  // Determine Fee based on mode
  let fee = bookingMode === 'VIRTUAL' ? doctor.videoFee : doctor.consultationFee;
  if (fee === undefined || fee === null) throw new AppError('Fee not defined for this mode', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);

  // Auto-Calculate Patient Classification
  let calculatedClassification: 'NEW' | 'EXISTING' | 'FOLLOW_UP' = 'NEW';

  const previousAppts = await prisma.appointment.findMany({
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
  const recentCompletedAppointment = await prisma.appointment.findFirst({
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
    const coupon = await prisma.coupon.findFirst({
      where: { code: couponCode, userId: patientId, isUsed: false, isActive: true, expiresAt: { gt: new Date() } }
    });
    if (coupon) {
      if (coupon.discountType === 'PERCENTAGE') {
        fee = fee - (fee * (coupon.discountValue / 100));
      } else {
        fee = Math.max(0, fee - coupon.discountValue);
      }
      await prisma.coupon.update({ where: { id: coupon.id }, data: { isUsed: true } });
    }
  }

  // Apply Wallet
  if (useWalletBalance) {
    const patientUser = await prisma.user.findUnique({ where: { id: patientId } });
    if (patientUser && patientUser.walletBalance > 0) {
      if (patientUser.walletBalance >= fee) {
        await prisma.user.update({ where: { id: patientId }, data: { walletBalance: { decrement: fee } } });
        fee = 0;
      } else {
        fee = fee - patientUser.walletBalance;
        await prisma.user.update({ where: { id: patientId }, data: { walletBalance: 0 } });
      }
    }
  }

  const parsedSymptoms = typeof symptoms === 'string' ? JSON.parse(symptoms) : symptoms;

  // Handle Document and Voice Note Uploads
  const documents: string[] = [];
  let voiceNoteUrl: string | null = null;

  if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
    // Process Documents
    if (req.files['documents']) {
      for (const file of req.files['documents']) {
        try {
          const url = await uploadToR2(file.buffer, file.originalname, file.mimetype);
          documents.push(url);
        } catch (err) {
          console.error('File upload failed, skipping file', err);
        }
      }
    }
    // Process Voice Note
    if (req.files['voiceNote'] && req.files['voiceNote'].length > 0) {
      try {
        const file = req.files['voiceNote'][0];
        voiceNoteUrl = await uploadToR2(file.buffer, file.originalname, file.mimetype);
      } catch (err) {
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

    const count = await prisma.appointment.count({
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
    const doctorCommissionRate = Number(await getSystemSetting('COMMISSION_RATE_DOCTOR', 10));
    platformFee = (fee * doctorCommissionRate) / 100;
  }

  // Resolve valid Branch ID from Database (supports ID, name, or city slug)
  let validBranchId: string | null = null;
  if (branchId) {
    const existingBranch = await prisma.branch.findFirst({
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

  // Fallback: If no branch specified or virtual mode, assign doctor's primary branch or first hospital branch
  if (!validBranchId) {
    if (doctor.clinicsCovered && doctor.clinicsCovered.length > 0) {
      const docBranch = await prisma.branch.findFirst({
        where: {
          OR: [
            { id: doctor.clinicsCovered[0] },
            { name: { equals: doctor.clinicsCovered[0], mode: 'insensitive' } }
          ]
        }
      });
      if (docBranch) validBranchId = docBranch.id;
    }
    if (!validBranchId) {
      const firstBranch = await prisma.branch.findFirst();
      if (firstBranch) {
        validBranchId = firstBranch.id;
      }
    }
  }

  // Create Appointment
  const appointment = await prisma.appointment.create({
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
    },
    include: {
      patient: { select: { id: true, name: true, phone: true, age: true } },
      branch: { select: { id: true, name: true, city: true } }
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
      } catch (err) {
        console.error('Razorpay API failed (likely invalid keys). Using dummy order ID instead.', err);
      }
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { razorpayOrderId }
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: {
        appointment,
        razorpayOrderId,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
        amount: options.amount,
        currency: options.currency,
      }
    });
  }

  // If CASH (Physical)
  return res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    message: 'Appointment confirmed successfully',
    data: { appointment }
  });
});

/**
 * Verify Razorpay Payment Signature
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!appointmentId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Missing payment verification details', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });

  if (!appointment || !appointment.razorpayOrderId) {
    throw new AppError('Invalid appointment or missing order ID', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  // Verify Signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(appointment.razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    throw new AppError('Invalid payment signature', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  // Payment is valid
  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      razorpayPaymentId,
    }
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Payment verified and appointment confirmed',
    data: { appointment: updatedAppointment }
  });
});
