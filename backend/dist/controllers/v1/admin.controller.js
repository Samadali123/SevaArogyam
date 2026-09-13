"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpecialty = exports.updateSpecialty = exports.getAdminSpecialties = exports.createSpecialty = exports.deleteCareService = exports.updateCareService = exports.getAdminCareServices = exports.createCareService = exports.updateSystemSettings = exports.getSystemSettings = exports.getEMRLogs = exports.getTransactionRecords = exports.getRevenueAudit = exports.getDashboardStats = exports.updatePatient = exports.getPatients = exports.deleteStaff = exports.updateStaff = exports.getStaffById = exports.getStaff = exports.createStaff = exports.deleteDoctor = exports.updateDoctor = exports.getDoctorById = exports.getDoctors = exports.createDoctor = void 0;
const database_1 = require("../../config/database.js");
const AppError_1 = require("../../errors/AppError.js");
const errorCodes_1 = require("../../errors/errorCodes.js");
const constants_1 = require("../../utilities/constants.js");
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
const auth_1 = require("../../utilities/auth.js");
const mailer_1 = require("../../utilities/mailer.js");
const emailTemplates_1 = require("../../utilities/emailTemplates.js");
const upload_1 = require("../../utilities/upload.js");
// ─────────────────────────────────────────────
// Doctors Management
// ─────────────────────────────────────────────
exports.createDoctor = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, specialization, qualifications, regNumber, consultationFee, videoFee, experienceYears, clinicalBio, opdScheduleSummary, languagesSpoken, clinicsCovered } = req.body;
    if (!name || !email) {
        throw new AppError_1.AppError('Name and email are required to create a doctor', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
        throw new AppError_1.AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const existingUser = await database_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError_1.AppError('A user with this email already exists', constants_1.HTTP_STATUS.CONFLICT, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const rawPassword = (0, auth_1.generateRandomPassword)();
    const hashedPassword = await (0, auth_1.hashPassword)(rawPassword);
    let profilePhotoUrl = '/images/default_profile.webp';
    if (req.file) {
        profilePhotoUrl = await (0, upload_1.uploadToR2)(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    let parsedClinicsCovered = [];
    if (typeof clinicsCovered === 'string') {
        try {
            parsedClinicsCovered = JSON.parse(clinicsCovered);
        }
        catch {
            parsedClinicsCovered = clinicsCovered.split(',').map((s) => s.trim()).filter(Boolean);
        }
    }
    else if (Array.isArray(clinicsCovered)) {
        parsedClinicsCovered = clinicsCovered;
    }
    const doctor = await database_1.prisma.user.create({
        data: {
            name,
            email,
            phone: cleanPhone,
            password: hashedPassword,
            role: constants_1.USER_ROLES.DOCTOR,
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
    await (0, mailer_1.sendEmail)(email, 'Welcome to SevaArogyam - Doctor Portal Credentials', (0, emailTemplates_1.getDoctorCredentialsEmailHTML)(name, email, rawPassword));
    res.status(constants_1.HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Doctor created successfully and credentials sent to their email.',
        data: { doctor },
    });
});
exports.getDoctors = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search } = req.query;
    const whereClause = { role: constants_1.USER_ROLES.DOCTOR, isActive: true };
    if (search && typeof search === 'string') {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { specialization: { contains: search, mode: 'insensitive' } },
        ];
    }
    const doctors = await database_1.prisma.user.findMany({
        where: whereClause,
        select: {
            id: true, name: true, email: true, phone: true, specialization: true, qualifications: true,
            regNumber: true, clinicalBio: true, opdScheduleSummary: true, languagesSpoken: true, clinicsCovered: true,
            profilePhoto: true, consultationFee: true, videoFee: true, experienceYears: true, branch: true, isActive: true,
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { doctors } });
});
exports.getDoctorById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctor = await database_1.prisma.user.findFirst({
        where: { id: req.params.id, role: constants_1.USER_ROLES.DOCTOR },
        select: {
            id: true, name: true, email: true, phone: true, specialization: true, qualifications: true,
            regNumber: true, consultationFee: true, videoFee: true, experienceYears: true, clinicalBio: true, opdScheduleSummary: true, languagesSpoken: true, clinicsCovered: true, profilePhoto: true, isActive: true,
        }
    });
    if (!doctor)
        throw new AppError_1.AppError('Doctor not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { doctor } });
});
exports.updateDoctor = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, specialization, qualifications, regNumber, consultationFee, videoFee, experienceYears, clinicalBio, opdScheduleSummary, languagesSpoken, clinicsCovered } = req.body;
    const doctor = await database_1.prisma.user.findFirst({ where: { id, role: constants_1.USER_ROLES.DOCTOR } });
    if (!doctor)
        throw new AppError_1.AppError('Doctor not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    let cleanPhone = doctor.phone;
    if (phone) {
        const formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length !== 10 || !/^[6-9]/.test(formattedPhone)) {
            throw new AppError_1.AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
        }
        cleanPhone = formattedPhone;
    }
    let profilePhotoUrl = doctor.profilePhoto || '/images/default_profile.webp';
    if (req.file) {
        profilePhotoUrl = await (0, upload_1.uploadToR2)(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    let parsedClinicsCovered = doctor.clinicsCovered;
    if (clinicsCovered !== undefined) {
        if (typeof clinicsCovered === 'string') {
            try {
                parsedClinicsCovered = JSON.parse(clinicsCovered);
            }
            catch {
                parsedClinicsCovered = clinicsCovered.split(',').map((s) => s.trim()).filter(Boolean);
            }
        }
        else if (Array.isArray(clinicsCovered)) {
            parsedClinicsCovered = clinicsCovered;
        }
    }
    const updatedDoctor = await database_1.prisma.user.update({
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
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { doctor: updatedDoctor } });
});
exports.deleteDoctor = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    try {
        await database_1.prisma.user.delete({ where: { id } });
    }
    catch (e) {
        await database_1.prisma.user.updateMany({
            where: { id, role: constants_1.USER_ROLES.DOCTOR },
            data: { isActive: false },
        });
    }
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', message: 'Doctor deleted successfully' });
});
// ─────────────────────────────────────────────
// Staff Management
// ─────────────────────────────────────────────
exports.createStaff = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, branch } = req.body;
    if (!name || !email) {
        throw new AppError_1.AppError('Name and email are required to create staff', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
        throw new AppError_1.AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const existingUser = await database_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError_1.AppError('A user with this email already exists', constants_1.HTTP_STATUS.CONFLICT, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const rawPassword = (0, auth_1.generateRandomPassword)();
    const hashedPassword = await (0, auth_1.hashPassword)(rawPassword);
    let profilePhotoUrl = null;
    if (req.file) {
        profilePhotoUrl = await (0, upload_1.uploadToR2)(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    const staff = await database_1.prisma.user.create({
        data: {
            name, email, phone: cleanPhone, branch,
            password: hashedPassword,
            role: constants_1.USER_ROLES.STAFF,
            profilePhoto: profilePhotoUrl,
        },
    });
    await (0, mailer_1.sendEmail)(email, 'Welcome to SevaArogyam - Staff Portal Credentials', (0, emailTemplates_1.getStaffCredentialsEmailHTML)(name, email, rawPassword));
    res.status(constants_1.HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Staff created successfully and credentials sent to their email.',
        data: { staff: { id: staff.id, name: staff.name, email: staff.email, phone: staff.phone, branch: staff.branch } },
    });
});
exports.getStaff = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search } = req.query;
    const whereClause = { role: constants_1.USER_ROLES.STAFF, isActive: true };
    if (search && typeof search === 'string') {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { branch: { contains: search, mode: 'insensitive' } },
        ];
    }
    const staff = await database_1.prisma.user.findMany({
        where: whereClause,
        select: { id: true, name: true, email: true, phone: true, branch: true, profilePhoto: true, isActive: true },
        orderBy: { createdAt: 'desc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { staff } });
});
exports.getStaffById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const staff = await database_1.prisma.user.findFirst({
        where: { id: req.params.id, role: constants_1.USER_ROLES.STAFF },
        select: { id: true, name: true, email: true, phone: true, branch: true, profilePhoto: true, isActive: true }
    });
    if (!staff)
        throw new AppError_1.AppError('Staff not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { staff } });
});
exports.updateStaff = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, phone, branch } = req.body;
    const staff = await database_1.prisma.user.findFirst({ where: { id, role: constants_1.USER_ROLES.STAFF } });
    if (!staff)
        throw new AppError_1.AppError('Staff not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    let cleanPhone = staff.phone;
    if (phone) {
        const formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length !== 10 || !/^[6-9]/.test(formattedPhone)) {
            throw new AppError_1.AppError('A valid 10-digit Indian mobile number is required (starting with 6-9)', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
        }
        cleanPhone = formattedPhone;
    }
    let profilePhotoUrl = staff.profilePhoto;
    if (req.file) {
        profilePhotoUrl = await (0, upload_1.uploadToR2)(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    const updatedStaff = await database_1.prisma.user.update({
        where: { id },
        data: { name, phone: cleanPhone, branch, profilePhoto: profilePhotoUrl },
        select: { id: true, name: true, email: true, phone: true, branch: true, profilePhoto: true }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { staff: updatedStaff } });
});
exports.deleteStaff = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    try {
        await database_1.prisma.user.delete({ where: { id } });
    }
    catch (e) {
        await database_1.prisma.user.updateMany({
            where: { id, role: constants_1.USER_ROLES.STAFF },
            data: { isActive: false },
        });
    }
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', message: 'Staff deleted successfully' });
});
// ─────────────────────────────────────────────
// Patients Management (Admin)
// ─────────────────────────────────────────────
exports.getPatients = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date, month, year, search } = req.query;
    const whereClause = { role: constants_1.USER_ROLES.PATIENT };
    if (search && typeof search === 'string') {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        whereClause.createdAt = { gte: startDate, lt: endDate };
    }
    else if (month && year) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 1);
        whereClause.createdAt = { gte: startDate, lt: endDate };
    }
    else if (year) {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year) + 1, 0, 1);
        whereClause.createdAt = { gte: startDate, lt: endDate };
    }
    const patients = await database_1.prisma.user.findMany({
        where: whereClause,
        select: { id: true, name: true, email: true, phone: true, age: true, createdAt: true, isActive: true },
        orderBy: { createdAt: 'desc' },
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { patients } });
});
exports.updatePatient = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    const patient = await database_1.prisma.user.findFirst({ where: { id, role: constants_1.USER_ROLES.PATIENT } });
    if (!patient)
        throw new AppError_1.AppError('Patient not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    const updatedPatient = await database_1.prisma.user.update({
        where: { id },
        data: { name, phone, email },
        select: { id: true, name: true, email: true, phone: true }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { patient: updatedPatient } });
});
// ─────────────────────────────────────────────
// Admin Hub & Audit Dashboards
// ─────────────────────────────────────────────
exports.getDashboardStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate && endDate) {
        dateFilter.appointmentDate = {
            gte: new Date(startDate),
            lt: new Date(endDate)
        };
    }
    // Active branches & Doctors
    const activeBranchesCount = await database_1.prisma.branch.count();
    const activeDoctorsCount = await database_1.prisma.user.count({ where: { role: constants_1.USER_ROLES.DOCTOR, isActive: true } });
    const allAppointments = await database_1.prisma.appointment.findMany({ where: dateFilter });
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
            if (appt.paymentMode === 'ONLINE')
                onlineRevenue += appt.fee;
            else
                cashRevenue += appt.fee;
        }
    }
    // Also factor in Care Service Orders
    const orderWhere = { status: 'PAID' };
    if (startDate && endDate) {
        orderWhere.createdAt = {
            gte: new Date(startDate),
            lt: new Date(endDate)
        };
    }
    const serviceOrders = await database_1.prisma.serviceOrder.findMany({ where: orderWhere });
    for (const order of serviceOrders) {
        totalGrossRevenue += order.amount;
        onlineRevenue += order.amount;
    }
    res.status(constants_1.HTTP_STATUS.OK).json({
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
exports.getRevenueAudit = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const apptWhere = { paymentStatus: 'PAID' };
    if (startDate && endDate) {
        apptWhere.appointmentDate = { gte: new Date(startDate), lt: new Date(endDate) };
    }
    const appointments = await database_1.prisma.appointment.findMany({
        where: apptWhere,
        include: { doctor: { select: { name: true } } }
    });
    const doctorEarnings = {};
    let onlineCollections = 0;
    let offlineCash = 0;
    for (const appt of appointments) {
        if (appt.paymentMode === 'ONLINE')
            onlineCollections += appt.fee;
        else
            offlineCash += appt.fee;
        if (!doctorEarnings[appt.doctorId]) {
            doctorEarnings[appt.doctorId] = { doctorName: appt.doctor.name, count: 0, earnings: 0 };
        }
        doctorEarnings[appt.doctorId].count += 1;
        doctorEarnings[appt.doctorId].earnings += appt.fee;
    }
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        data: {
            totalGrossRevenue: onlineCollections + offlineCash,
            onlineCollections,
            offlineCash,
            doctorPerformance: Object.values(doctorEarnings)
        }
    });
});
exports.getTransactionRecords = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    const apptWhere = {};
    if (startDate && endDate) {
        apptWhere.createdAt = { gte: new Date(startDate), lt: new Date(endDate) };
    }
    const appointments = await database_1.prisma.appointment.findMany({
        where: apptWhere,
        include: {
            patient: { select: { name: true, phone: true } },
            doctor: { select: { name: true } },
            branch: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    const transactions = appointments.map(appt => {
        const rawName = appt.patientName || appt.patient?.name;
        const patientName = rawName || (appt.patient?.phone ? `Patient (${appt.patient.phone})` : 'N/A');
        return {
            id: appt.id,
            paymentId: appt.razorpayPaymentId || `CASH-${appt.id.substring(0, 6)}`,
            patientName,
            patientPhone: appt.patient?.phone || '',
            doctorName: appt.doctor?.name || 'Doctor',
            branchName: appt.branch?.name || 'Virtual',
            method: appt.paymentMode,
            amount: appt.fee,
            status: appt.paymentStatus
        };
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { transactions } });
});
exports.getEMRLogs = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const appointments = await database_1.prisma.appointment.findMany({
        include: {
            patient: { select: { name: true, phone: true } },
            doctor: { select: { name: true } },
            branch: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    const logs = appointments.map(appt => ({
        token: appt.tokenNumber ? `${appt.branch?.name?.substring(0, 3).toUpperCase()}-${appt.tokenNumber}` : `VID-${appt.id.substring(0, 4)}`,
        patientName: `${appt.patient.name} (${appt.patient.phone})`,
        doctorName: appt.doctor.name,
        branchName: appt.branch?.name || 'Virtual Telemedicine Room',
        mode: appt.bookingMode,
        amount: appt.fee,
        status: appt.status
    }));
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { logs } });
});
exports.getSystemSettings = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const settings = await database_1.prisma.systemSetting.findMany();
    // Return as a key-value object
    const config = {};
    settings.forEach(s => { config[s.key] = s.value; });
    // Provide defaults if missing
    if (config['REFERRAL_BONUS_AMOUNT'] === undefined)
        config['REFERRAL_BONUS_AMOUNT'] = 150;
    if (config['REFERRAL_DISCOUNT_PERCENT'] === undefined)
        config['REFERRAL_DISCOUNT_PERCENT'] = 5;
    if (config['COMMISSION_RATE_PHARMACY'] === undefined)
        config['COMMISSION_RATE_PHARMACY'] = 10;
    if (config['COMMISSION_RATE_DIAGNOSTICS'] === undefined)
        config['COMMISSION_RATE_DIAGNOSTICS'] = 10;
    if (config['COMMISSION_RATE_LABORATORY'] === undefined)
        config['COMMISSION_RATE_LABORATORY'] = 10;
    if (config['COMMISSION_RATE_DOCTOR'] === undefined)
        config['COMMISSION_RATE_DOCTOR'] = 10;
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { settings: config } });
});
exports.updateSystemSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const settingsInput = req.body; // e.g. { REFERRAL_BONUS_AMOUNT: 200, COMMISSION_RATE_PHARMACY: 12 }
    for (const [key, value] of Object.entries(settingsInput)) {
        await database_1.prisma.systemSetting.upsert({
            where: { key },
            update: { value: value },
            create: { key, value: value }
        });
    }
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', message: 'Settings updated successfully' });
});
// ─────────────────────────────────────────────
// Care Services Management
// ─────────────────────────────────────────────
exports.createCareService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, category, price, doctorId, isActive } = req.body;
    if (!name || !category || price === undefined || !doctorId) {
        throw new AppError_1.AppError('Name, category, price, and doctorId are required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const service = await database_1.prisma.careService.create({
        data: {
            name,
            description,
            category,
            price: Number(price),
            doctorId,
            isActive: isActive !== undefined ? isActive : true
        }
    });
    res.status(constants_1.HTTP_STATUS.CREATED).json({ status: 'success', data: service });
});
exports.getAdminCareServices = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const services = await database_1.prisma.careService.findMany({
        include: { doctor: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: services });
});
exports.updateCareService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, description, category, price, doctorId, isActive } = req.body;
    const existing = await database_1.prisma.careService.findUnique({ where: { id } });
    let service;
    if (!existing) {
        service = await database_1.prisma.careService.create({
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
    }
    else {
        service = await database_1.prisma.careService.update({
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
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: service });
});
exports.deleteCareService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existing = await database_1.prisma.careService.findUnique({ where: { id } });
    if (existing) {
        await database_1.prisma.careService.delete({ where: { id } });
    }
    res.status(constants_1.HTTP_STATUS.NO_CONTENT).send();
});
// ─────────────────────────────────────────────
// Specialty Management
// ─────────────────────────────────────────────
exports.createSpecialty = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { nameEn, nameHi, category, tagline, description, conditionsTreated, proceduresAndTech, bannerUrl, isActive } = req.body;
    if (!nameEn || !category) {
        throw new AppError_1.AppError('English name and category are required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const specialty = await database_1.prisma.specialty.create({
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
    res.status(constants_1.HTTP_STATUS.CREATED).json({ status: 'success', data: specialty });
});
exports.getAdminSpecialties = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const specialties = await database_1.prisma.specialty.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: specialties });
});
exports.updateSpecialty = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { nameEn, nameHi, category, tagline, description, conditionsTreated, proceduresAndTech, bannerUrl, isActive } = req.body;
    const specialty = await database_1.prisma.specialty.update({
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
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: specialty });
});
exports.deleteSpecialty = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await database_1.prisma.specialty.delete({ where: { id } });
    res.status(constants_1.HTTP_STATUS.NO_CONTENT).send();
});
//# sourceMappingURL=admin.controller.js.map