import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS, USER_ROLES } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';

/**
 * Get Staff Dashboard Stats (Waiting, Inside, Completed, Active Doctors)
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.user!.id;

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || !staff.branch) {
    throw new AppError('Staff is not assigned to any branch', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      branchId: staff.branch,
      appointmentDate: { gte: startOfDay, lt: endOfDay }
    },
    select: { status: true, doctorId: true }
  });

  const waitingQueue = todayAppointments.filter(a => a.status === 'CONFIRMED').length;
  const insideConsultation = todayAppointments.filter(a => a.status === 'IN_PROGRESS').length;
  const completedToday = todayAppointments.filter(a => a.status === 'COMPLETED').length;

  const activeDoctors = new Set(todayAppointments.map(a => a.doctorId)).size;

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      waitingQueue,
      insideConsultation,
      completedToday,
      activeDoctors
    }
  });
});

/**
 * Get Live OPD Queue for the branch
 */
export const getLiveQueue = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.user!.id;

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || !staff.branch) {
    throw new AppError('Staff is not assigned to any branch', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const queue = await prisma.appointment.findMany({
    where: {
      branchId: staff.branch,
      appointmentDate: { gte: startOfDay, lt: endOfDay },
      bookingMode: 'PHYSICAL'
    },
    include: {
      patient: { select: { name: true, phone: true, age: true } },
      doctor: { select: { name: true, specialization: true } }
    },
    orderBy: { tokenNumber: 'asc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { queue } });
});

/**
 * Get all offline (PHYSICAL) appointments for a specific doctor with timings & token numbers
 */
export const getDoctorOfflineAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  const targetDate = date ? new Date(date as string) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      bookingMode: 'PHYSICAL',
      appointmentDate: { gte: startOfDay, lte: endOfDay }
    },
    include: {
      patient: { select: { id: true, name: true, phone: true, age: true } },
      branch: { select: { id: true, name: true } }
    },
    orderBy: [
      { timeSlot: 'asc' },
      { tokenNumber: 'asc' }
    ]
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { appointments } });
});

/**
 * Book an offline/walk-in appointment (generates token, auto-registers patient if new)
 */
export const bookWalkInAppointment = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.user!.id;
  const { phone, name, age, doctorId, timeSlot, fee, paymentMode } = req.body; // paymentMode defaults to CASH in frontend for walkin

  if (!phone || !name || !doctorId || !timeSlot) {
    throw new AppError('Missing patient or booking details', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || !staff.branch) {
    throw new AppError('Staff is not assigned to any branch', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  // Find or Create Patient
  let patient = await prisma.user.findUnique({ where: { phone } });
  if (!patient) {
    const patientIdGen = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    patient = await prisma.user.create({
      data: {
        phone,
        name,
        age: age ? parseInt(age) : null,
        role: USER_ROLES.PATIENT,
        patientId: patientIdGen,
        isActive: true
      }
    });
  }

  const appointmentDate = new Date();
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
  
  const tokenNumber = count + 1; // Sequential token

  const actualFee = fee ? parseFloat(fee) : 300; // fallback if not provided

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId,
      branchId: staff.branch,
      bookingMode: 'PHYSICAL',
      patientClassification: 'NEW', // Defaulting for walkins unless specified
      appointmentDate: appointmentDate,
      timeSlot,
      status: paymentMode === 'CASH' ? 'CONFIRMED' : 'PENDING',
      paymentMode: paymentMode || 'CASH',
      paymentStatus: paymentMode === 'CASH' ? 'PAID' : 'PENDING',
      fee: actualFee,
      tokenNumber,
      symptoms: []
    }
  });

  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    message: 'Walk-in Appointment Booked successfully',
    data: { appointment, patient }
  });
});

/**
 * Update Appointment Status (e.g., Mark IN_PROGRESS or COMPLETED)
 */
export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const staffId = req.user!.id;
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError('Status is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff || !staff.branch) {
    throw new AppError('Staff is not assigned to any branch', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, branchId: staff.branch }
  });

  if (!appointment) throw new AppError('Appointment not found in your branch', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: { status }
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Status updated successfully',
    data: { appointment: updatedAppointment }
  });
});
