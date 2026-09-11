import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';
import { generatePrescriptionPDF } from '@utilities/pdf';
import { AccessToken } from 'livekit-server-sdk';
import { AppointmentStatus, Prisma } from '@prisma/client';

/**
 * Fetch patient queues for the doctor (ALL, WAITING, IN_PROGRESS, COMPLETED)
 */
export const getPatientQueue = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { status, date } = req.query;

  const whereClause: Prisma.AppointmentWhereInput = { doctorId };

  if (status && typeof status === 'string' && status !== 'ALL') {
    // Mapping 'WAITING' from frontend to 'CONFIRMED' in DB (since pending means unbooked/unpaid)
    if (status === 'WAITING') {
      whereClause.status = 'CONFIRMED';
    } else {
      whereClause.status = status as AppointmentStatus;
    }
  } else {
    // If 'ALL', we generally only want CONFIRMED, IN_PROGRESS, COMPLETED
    whereClause.status = { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] };
  }

  // Filter by date (defaults to today if not provided, or fetches all if explicitly requested)
  if (date) {
    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    whereClause.appointmentDate = { gte: startOfDay, lte: endOfDay };
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      patient: { select: { id: true, name: true, phone: true, age: true } },
      branch: { select: { id: true, name: true } }
    },
    orderBy: [
      { appointmentDate: 'asc' },
      { timeSlot: 'asc' }
    ]
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { appointments } });
});

/**
 * Update the status of an appointment (e.g. IN_PROGRESS or COMPLETED)
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await prisma.appointment.findFirst({ where: { id, doctorId } });
  if (!appointment) throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: { status: status as AppointmentStatus }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { appointment: updatedAppointment } });
});

/**
 * Write/Save a prescription for the patient
 */
export const writePrescription = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { id } = req.params;
  // req.body should contain { diagnosis, medicines, investigations, examinationNotes, advice }
  const prescriptionData = req.body; 

  const appointment = await prisma.appointment.findFirst({ where: { id, doctorId } });
  if (!appointment) throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: { prescription: prescriptionData }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Prescription saved successfully', data: { appointment: updatedAppointment } });
});

/**
 * Download Prescription as PDF
 */
export const downloadPrescription = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { id } = req.params;

  const appointment = await prisma.appointment.findFirst({ 
    where: { id, doctorId },
    include: { patient: true, doctor: true, branch: true }
  });
  
  if (!appointment) throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  // This will pipe the PDF to the response
  generatePrescriptionPDF(appointment, res);
});

/**
 * Generate a LiveKit Token for the Doctor to join the Video Room
 */
export const joinVideoCall = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { id } = req.params;

  const appointment = await prisma.appointment.findFirst({
    where: { id, doctorId, bookingMode: 'VIRTUAL' },
    include: { doctor: true }
  });

  if (!appointment) throw new AppError('Virtual appointment not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  const roomName = appointment.id;
  const participantName = `Dr. ${appointment.doctor.name}`;

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: doctorId, name: participantName }
  );

  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, roomAdmin: true });

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
// Care Services (Pharmacy, Diagnostics, Lab)
// ─────────────────────────────────────────────

export const createCareService = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { name, description, category, price } = req.body;

  if (!name || !category || !price) {
    throw new AppError('Name, category, and price are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const service = await prisma.careService.create({
    data: {
      doctorId,
      name,
      description,
      category,
      price: parseFloat(price)
    }
  });

  res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: { service } });
});

export const getMyCareServices = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { category } = req.query;

  const whereClause: any = { doctorId };
  if (category) {
    whereClause.category = category;
  }

  const services = await prisma.careService.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { services } });
});

export const updateCareService = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { id } = req.params;
  const { name, description, category, price, isActive } = req.body;

  const service = await prisma.careService.findFirst({ where: { id, doctorId } });
  if (!service) throw new AppError('Service not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  const updatedService = await prisma.careService.update({
    where: { id },
    data: {
      name,
      description,
      category,
      price: price ? parseFloat(price) : undefined,
      isActive: isActive !== undefined ? isActive : undefined
    }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { service: updatedService } });
});

export const deleteCareService = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  const { id } = req.params;

  const service = await prisma.careService.findFirst({ where: { id, doctorId } });
  if (!service) throw new AppError('Service not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  await prisma.careService.delete({ where: { id } });

  res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Service deleted successfully' });
});
