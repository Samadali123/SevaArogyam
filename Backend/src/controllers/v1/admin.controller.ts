import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS, USER_ROLES } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';
import { generateRandomPassword, hashPassword } from '@utilities/auth';
import { sendEmail } from '@utilities/mailer';
import { getDoctorCredentialsEmailHTML, getStaffCredentialsEmailHTML } from '@utilities/emailTemplates';
import { uploadToR2 } from '@utilities/upload';
import { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────
// Doctors Management
// ─────────────────────────────────────────────
export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, specialization, qualifications, regNumber, consultationFee, videoFee, experienceYears, clinicalBio, opdScheduleSummary, languagesSpoken, clinicsCovered } = req.body;

  if (!name || !email) {
    throw new AppError('Name and email are required to create a doctor', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
    throw new AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('A user with this email already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const rawPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(rawPassword);

  let profilePhotoUrl: string = '/images/default_profile.webp';
  if (req.file) {
    profilePhotoUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
  }

  let parsedClinicsCovered: string[] = [];
  if (typeof clinicsCovered === 'string') {
    try {
      parsedClinicsCovered = JSON.parse(clinicsCovered);
    } catch {
      parsedClinicsCovered = clinicsCovered.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } else if (Array.isArray(clinicsCovered)) {
    parsedClinicsCovered = clinicsCovered;
  }

  const doctor = await prisma.user.create({
    data: {
      name,
      email,
      phone: cleanPhone,
      password: hashedPassword,
      role: USER_ROLES.DOCTOR,
      specialization,
      qualifications,
      regNumber,
      consultationFee: consultationFee ? parseFloat(consultationFee) : null,
      videoFee: videoFee ? parseFloat(videoFee) : null,
      experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
      clinicalBio,
      opdScheduleSummary,
      languagesSpoken: typeof languagesSpoken === 'string' ? JSON.parse(languagesSpoken) : languagesSpoken || [],
      clinicsCovered: parsedClinicsCovered,
      profilePhoto: profilePhotoUrl,
    },
  });

  await sendEmail(email, 'Welcome to SevaArogyam - Doctor Portal Credentials', getDoctorCredentialsEmailHTML(name, email, rawPassword));

  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    message: 'Doctor created successfully and credentials sent to their email.',
    data: { doctor },
  });
});

export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  
  const whereClause: Prisma.UserWhereInput = { role: USER_ROLES.DOCTOR, isActive: true };
  if (search && typeof search === 'string') {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { specialization: { contains: search, mode: 'insensitive' } },
    ];
  }

  const doctors = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true, name: true, email: true, phone: true, specialization: true, qualifications: true,
      regNumber: true, clinicalBio: true, opdScheduleSummary: true, languagesSpoken: true, clinicsCovered: true,
      profilePhoto: true, consultationFee: true, videoFee: true, experienceYears: true, branch: true, isActive: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { doctors } });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await prisma.user.findFirst({
    where: { id: req.params.id, role: USER_ROLES.DOCTOR },
    select: {
      id: true, name: true, email: true, phone: true, specialization: true, qualifications: true,
      regNumber: true, consultationFee: true, videoFee: true, experienceYears: true, clinicalBio: true, opdScheduleSummary: true, languagesSpoken: true, clinicsCovered: true, profilePhoto: true, isActive: true,
    }
  });

  if (!doctor) throw new AppError('Doctor not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { doctor } });
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, specialization, qualifications, regNumber, consultationFee, videoFee, experienceYears, clinicalBio, opdScheduleSummary, languagesSpoken, clinicsCovered } = req.body;

  const doctor = await prisma.user.findFirst({ where: { id, role: USER_ROLES.DOCTOR } });
  if (!doctor) throw new AppError('Doctor not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  let cleanPhone: string | null = doctor.phone;
  if (phone) {
    const formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length !== 10 || !/^[6-9]/.test(formattedPhone)) {
      throw new AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
    }
    cleanPhone = formattedPhone;
  }

  let profilePhotoUrl = doctor.profilePhoto || '/images/default_profile.webp';
  if (req.file) {
    profilePhotoUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
  }

  let parsedClinicsCovered = doctor.clinicsCovered;
  if (clinicsCovered !== undefined) {
    if (typeof clinicsCovered === 'string') {
      try {
        parsedClinicsCovered = JSON.parse(clinicsCovered);
      } catch {
        parsedClinicsCovered = clinicsCovered.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(clinicsCovered)) {
      parsedClinicsCovered = clinicsCovered;
    }
  }

  const updatedDoctor = await prisma.user.update({
    where: { id },
    data: {
      name, email, phone: cleanPhone, specialization, qualifications, regNumber, clinicalBio, opdScheduleSummary,
      languagesSpoken: typeof languagesSpoken === 'string' ? JSON.parse(languagesSpoken) : languagesSpoken,
      clinicsCovered: parsedClinicsCovered,
      profilePhoto: profilePhotoUrl,
      consultationFee: consultationFee ? parseFloat(consultationFee) : doctor.consultationFee,
      videoFee: videoFee ? parseFloat(videoFee) : doctor.videoFee,
      experienceYears: experienceYears ? parseInt(experienceYears, 10) : doctor.experienceYears,
    },
    select: {
      id: true, name: true, email: true, phone: true, specialization: true, qualifications: true,
      regNumber: true, clinicalBio: true, opdScheduleSummary: true, languagesSpoken: true, clinicsCovered: true,
      profilePhoto: true, consultationFee: true, videoFee: true, experienceYears: true, branch: true, isActive: true,
    }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { doctor: updatedDoctor } });
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    await prisma.user.updateMany({
      where: { id, role: USER_ROLES.DOCTOR },
      data: { isActive: false },
    });
  }
  res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Doctor deleted successfully' });
});

// ─────────────────────────────────────────────
// Staff Management
// ─────────────────────────────────────────────
export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, branch } = req.body;

  if (!name || !email) {
    throw new AppError('Name and email are required to create staff', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
    throw new AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('A user with this email already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const rawPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(rawPassword);

  let profilePhotoUrl = null;
  if (req.file) {
    profilePhotoUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
  }

  const staff = await prisma.user.create({
    data: {
      name, email, phone: cleanPhone, branch,
      password: hashedPassword,
      role: USER_ROLES.STAFF,
      profilePhoto: profilePhotoUrl,
    },
  });

  await sendEmail(email, 'Welcome to SevaArogyam - Staff Portal Credentials', getStaffCredentialsEmailHTML(name, email, rawPassword));

  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    message: 'Staff created successfully and credentials sent to their email.',
    data: { staff: { id: staff.id, name: staff.name, email: staff.email, phone: staff.phone, branch: staff.branch } },
  });
});

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  
  const whereClause: Prisma.UserWhereInput = { role: USER_ROLES.STAFF, isActive: true };
  if (search && typeof search === 'string') {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { branch: { contains: search, mode: 'insensitive' } },
    ];
  }

  const staff = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, name: true, email: true, phone: true, branch: true, profilePhoto: true, isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { staff } });
});

export const getStaffById = asyncHandler(async (req: Request, res: Response) => {
  const staff = await prisma.user.findFirst({
    where: { id: req.params.id, role: USER_ROLES.STAFF },
    select: { id: true, name: true, email: true, phone: true, branch: true, profilePhoto: true, isActive: true }
  });

  if (!staff) throw new AppError('Staff not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { staff } });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, branch } = req.body;

  const staff = await prisma.user.findFirst({ where: { id, role: USER_ROLES.STAFF } });
  if (!staff) throw new AppError('Staff not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  let cleanPhone: string | null = staff.phone;
  if (phone) {
    const formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length !== 10 || !/^[6-9]/.test(formattedPhone)) {
      throw new AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
    }
    cleanPhone = formattedPhone;
  }

  let profilePhotoUrl = staff.profilePhoto;
  if (req.file) {
    profilePhotoUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
  }

  const updatedStaff = await prisma.user.update({
    where: { id },
    data: { name, phone: cleanPhone, branch, profilePhoto: profilePhotoUrl },
    select: { id: true, name: true, email: true, phone: true, branch: true, profilePhoto: true }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { staff: updatedStaff } });
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    await prisma.user.updateMany({
      where: { id, role: USER_ROLES.STAFF },
      data: { isActive: false },
    });
  }
  res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Staff deleted successfully' });
});

// ─────────────────────────────────────────────
// Patients Management (Admin)
// ─────────────────────────────────────────────
export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const { date, month, year, search } = req.query;

  const whereClause: Prisma.UserWhereInput = { role: USER_ROLES.PATIENT };
  
  if (search && typeof search === 'string') {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (date) {
    const startDate = new Date(date as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    whereClause.createdAt = { gte: startDate, lt: endDate };
  } else if (month && year) {
    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 1);
    whereClause.createdAt = { gte: startDate, lt: endDate };
  } else if (year) {
    const startDate = new Date(parseInt(year as string), 0, 1);
    const endDate = new Date(parseInt(year as string) + 1, 0, 1);
    whereClause.createdAt = { gte: startDate, lt: endDate };
  }

  const patients = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, name: true, email: true, phone: true, age: true, createdAt: true, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { patients } });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;

  const patient = await prisma.user.findFirst({ where: { id, role: USER_ROLES.PATIENT } });
  if (!patient) throw new AppError('Patient not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  const updatedPatient = await prisma.user.update({
    where: { id },
    data: { name, phone, email },
    select: { id: true, name: true, email: true, phone: true }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { patient: updatedPatient } });
});

// ─────────────────────────────────────────────
// Admin Hub & Audit Dashboards
// ─────────────────────────────────────────────

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter.appointmentDate = {
      gte: new Date(startDate as string),
      lt: new Date(endDate as string)
    };
  }

  // Active branches & Doctors
  const activeBranchesCount = await prisma.branch.count();
  const activeDoctorsCount = await prisma.user.count({ where: { role: USER_ROLES.DOCTOR, isActive: true } });

  const allAppointments = await prisma.appointment.findMany({ where: dateFilter });
  
  const totalBookedAppointments = allAppointments.length;
  const totalRescheduledAppointments = allAppointments.filter(a => a.isRescheduled).length;
  const totalCancelledAppointments = allAppointments.filter(a => a.status === 'CANCELLED').length;
  const totalConfirmedAppointments = allAppointments.filter(a => a.status === 'CONFIRMED').length;
  const totalCompletedAppointments = allAppointments.filter(a => a.status === 'COMPLETED').length;

  const validAppointments = allAppointments.filter(a => ['COMPLETED', 'CONFIRMED', 'IN_PROGRESS'].includes(a.status));
  
  const totalConsultations = validAppointments.length;
  let totalGrossRevenue = 0;
  let onlineRevenue = 0;
  let cashRevenue = 0;

  for (const appt of validAppointments) {
    if (appt.paymentStatus === 'PAID' || appt.fee > 0) {
      totalGrossRevenue += appt.fee;
      if (appt.paymentMode === 'ONLINE') onlineRevenue += appt.fee;
      else cashRevenue += appt.fee;
    }
  }

  // Also factor in Care Service Orders
  const orderWhere: any = { status: 'PAID' };
  if (startDate && endDate) {
    orderWhere.createdAt = {
      gte: new Date(startDate as string),
      lt: new Date(endDate as string)
    };
  }
  const serviceOrders = await prisma.serviceOrder.findMany({ where: orderWhere });
  for (const order of serviceOrders) {
    totalGrossRevenue += order.amount;
    onlineRevenue += order.amount;
  }

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      totalNetworkRevenue: totalGrossRevenue,
      onlineRevenue,
      cashRevenue,
      totalConsultations,
      totalBookedAppointments,
      totalRescheduledAppointments,
      totalCancelledAppointments,
      totalConfirmedAppointments,
      totalCompletedAppointments,
      activeBranchesCount,
      activeDoctorsCount
    }
  });
});

export const getRevenueAudit = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const apptWhere: any = { paymentStatus: 'PAID' };
  if (startDate && endDate) {
    apptWhere.appointmentDate = { gte: new Date(startDate as string), lt: new Date(endDate as string) };
  }

  const appointments = await prisma.appointment.findMany({
    where: apptWhere,
    include: { doctor: { select: { name: true } } }
  });

  const doctorEarnings: Record<string, { doctorName: string; count: number; earnings: number }> = {};
  
  let onlineCollections = 0;
  let offlineCash = 0;

  for (const appt of appointments) {
    if (appt.paymentMode === 'ONLINE') onlineCollections += appt.fee;
    else offlineCash += appt.fee;

    if (!doctorEarnings[appt.doctorId]) {
      doctorEarnings[appt.doctorId] = { doctorName: appt.doctor.name, count: 0, earnings: 0 };
    }
    doctorEarnings[appt.doctorId].count += 1;
    doctorEarnings[appt.doctorId].earnings += appt.fee;
  }

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      totalGrossRevenue: onlineCollections + offlineCash,
      onlineCollections,
      offlineCash,
      doctorPerformance: Object.values(doctorEarnings)
    }
  });
});

export const getTransactionRecords = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const apptWhere: any = {};
  if (startDate && endDate) {
    apptWhere.createdAt = { gte: new Date(startDate as string), lt: new Date(endDate as string) };
  }

  const appointments = await prisma.appointment.findMany({
    where: apptWhere,
    include: {
      patient: { select: { name: true, phone: true } },
      doctor: { select: { name: true } },
      branch: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const transactions = appointments.map(appt => {
    const rawName = (appt as any).patientName || appt.patient?.name;
    const patientName = rawName || (appt.patient?.phone ? `Patient (${appt.patient.phone})` : 'N/A');

    return {
      id: appt.id,
      paymentId: appt.razorpayPaymentId || `CASH-${appt.id.substring(0,6)}`,
      patientName,
      patientPhone: appt.patient?.phone || '',
      doctorName: appt.doctor?.name || 'Doctor',
      branchName: appt.branch?.name || 'Virtual',
      method: appt.paymentMode,
      amount: appt.fee,
      status: appt.paymentStatus
    };
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { transactions } });
});

export const getEMRLogs = asyncHandler(async (_req: Request, res: Response) => {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: { select: { name: true, phone: true } },
      doctor: { select: { name: true } },
      branch: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const logs = appointments.map(appt => ({
    token: appt.tokenNumber ? `${appt.branch?.name?.substring(0,3).toUpperCase()}-${appt.tokenNumber}` : `VID-${appt.id.substring(0,4)}`,
    patientName: `${appt.patient.name} (${appt.patient.phone})`,
    doctorName: appt.doctor.name,
    branchName: appt.branch?.name || 'Virtual Telemedicine Room',
    mode: appt.bookingMode,
    amount: appt.fee,
    status: appt.status
  }));

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { logs } });
});

export const getSystemSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await prisma.systemSetting.findMany();
  // Return as a key-value object
  const config: Record<string, any> = {};
  settings.forEach(s => { config[s.key] = s.value; });

  // Provide defaults if missing
  if (config['REFERRAL_BONUS_AMOUNT'] === undefined) config['REFERRAL_BONUS_AMOUNT'] = 150;
  if (config['REFERRAL_DISCOUNT_PERCENT'] === undefined) config['REFERRAL_DISCOUNT_PERCENT'] = 5;
  if (config['COMMISSION_RATE_PHARMACY'] === undefined) config['COMMISSION_RATE_PHARMACY'] = 10;
  if (config['COMMISSION_RATE_DIAGNOSTICS'] === undefined) config['COMMISSION_RATE_DIAGNOSTICS'] = 10;
  if (config['COMMISSION_RATE_LABORATORY'] === undefined) config['COMMISSION_RATE_LABORATORY'] = 10;
  if (config['COMMISSION_RATE_DOCTOR'] === undefined) config['COMMISSION_RATE_DOCTOR'] = 10;

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { settings: config } });
});

export const updateSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  const settingsInput = req.body; // e.g. { REFERRAL_BONUS_AMOUNT: 200, COMMISSION_RATE_PHARMACY: 12 }
  
  for (const [key, value] of Object.entries(settingsInput)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any }
    });
  }

  res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Settings updated successfully' });
});

// ─────────────────────────────────────────────
// Care Services Management
// ─────────────────────────────────────────────

export const createCareService = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, category, price, doctorId, isActive } = req.body;
  
  if (!name || !category || price === undefined || !doctorId) {
    throw new AppError('Name, category, price, and doctorId are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }
  
  const service = await prisma.careService.create({
    data: {
      name,
      description,
      category,
      price: Number(price),
      doctorId,
      isActive: isActive !== undefined ? isActive : true
    }
  });
  
  res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: service });
});

export const getAdminCareServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await prisma.careService.findMany({
    include: { doctor: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.status(HTTP_STATUS.OK).json({ status: 'success', data: services });
});

export const updateCareService = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, category, price, doctorId, isActive } = req.body;
  
  const existing = await prisma.careService.findUnique({ where: { id } });

  let service;
  if (!existing) {
    service = await prisma.careService.create({
      data: {
        id: id.startsWith('cs-') ? undefined : id,
        name: name || 'Care Service',
        description: description || '',
        category: category || 'PHARMACY',
        price: price !== undefined ? Number(price) : 0,
        doctorId: doctorId || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });
  } else {
    service = await prisma.careService.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(price !== undefined && { price: Number(price) }),
        ...(doctorId !== undefined && { doctorId }),
        ...(isActive !== undefined && { isActive }),
      }
    });
  }
  
  res.status(HTTP_STATUS.OK).json({ status: 'success', data: service });
});

export const deleteCareService = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.careService.findUnique({ where: { id } });
  if (existing) {
    await prisma.careService.delete({ where: { id } });
  }
  res.status(HTTP_STATUS.NO_CONTENT).send();
});

// ─────────────────────────────────────────────
// Specialty Management
// ─────────────────────────────────────────────

export const createSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const { nameEn, nameHi, category, tagline, description, conditionsTreated, proceduresAndTech, bannerUrl, isActive } = req.body;
  
  if (!nameEn || !category) {
    throw new AppError('English name and category are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const specialty = await prisma.specialty.create({
    data: {
      nameEn,
      nameHi: nameHi || '',
      category,
      tagline: tagline || '',
      description: description || '',
      conditionsTreated: Array.isArray(conditionsTreated) ? conditionsTreated : [],
      proceduresAndTech: Array.isArray(proceduresAndTech) ? proceduresAndTech : [],
      bannerUrl: bannerUrl || '',
      isActive: isActive !== undefined ? isActive : true
    }
  });

  res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: specialty });
});

export const getAdminSpecialties = asyncHandler(async (_req: Request, res: Response) => {
  const specialties = await prisma.specialty.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.status(HTTP_STATUS.OK).json({ status: 'success', data: specialties });
});

export const updateSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nameEn, nameHi, category, tagline, description, conditionsTreated, proceduresAndTech, bannerUrl, isActive } = req.body;

  const specialty = await prisma.specialty.update({
    where: { id },
    data: {
      ...(nameEn && { nameEn }),
      ...(nameHi !== undefined && { nameHi }),
      ...(category && { category }),
      ...(tagline !== undefined && { tagline }),
      ...(description !== undefined && { description }),
      ...(conditionsTreated && { conditionsTreated }),
      ...(proceduresAndTech && { proceduresAndTech }),
      ...(bannerUrl !== undefined && { bannerUrl }),
      ...(isActive !== undefined && { isActive }),
    }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: specialty });
});

export const deleteSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.specialty.delete({ where: { id } });
  res.status(HTTP_STATUS.NO_CONTENT).send();
});

