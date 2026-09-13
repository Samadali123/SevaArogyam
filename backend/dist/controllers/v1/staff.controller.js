"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.bookWalkInAppointment = exports.getDoctorOfflineAppointments = exports.getLiveQueue = exports.getDashboardStats = void 0;
const database_1 = require("@config/database");
const AppError_1 = require("@errors/AppError");
const errorCodes_1 = require("@errors/errorCodes");
const constants_1 = require("@utilities/constants");
const asyncHandler_1 = require("@utilities/asyncHandler");
/**
 * Get Staff Dashboard Stats (Waiting, Inside, Completed, Active Doctors)
 */
exports.getDashboardStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const staffId = req.user.id;
    const staff = await database_1.prisma.user.findUnique({ where: { id: staffId } });
    if (!staff || !staff.branch) {
        throw new AppError_1.AppError('Staff is not assigned to any branch', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const todayAppointments = await database_1.prisma.appointment.findMany({
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
    res.status(constants_1.HTTP_STATUS.OK).json({
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
exports.getLiveQueue = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const staffId = req.user.id;
    const staff = await database_1.prisma.user.findUnique({ where: { id: staffId } });
    if (!staff || !staff.branch) {
        throw new AppError_1.AppError('Staff is not assigned to any branch', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const queue = await database_1.prisma.appointment.findMany({
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
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { queue } });
});
/**
 * Get all offline (PHYSICAL) appointments for a specific doctor with timings & token numbers
 */
exports.getDoctorOfflineAppointments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const appointments = await database_1.prisma.appointment.findMany({
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
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { appointments } });
});
/**
 * Book an offline/walk-in appointment (generates token, auto-registers patient if new)
 */
exports.bookWalkInAppointment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const staffId = req.user.id;
    const { phone, name, age, doctorId, timeSlot, fee, paymentMode } = req.body; // paymentMode defaults to CASH in frontend for walkin
    if (!phone || !name || !doctorId || !timeSlot) {
        throw new AppError_1.AppError('Missing patient or booking details', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const staff = await database_1.prisma.user.findUnique({ where: { id: staffId } });
    if (!staff || !staff.branch) {
        throw new AppError_1.AppError('Staff is not assigned to any branch', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    // Find or Create Patient
    let patient = await database_1.prisma.user.findUnique({ where: { phone } });
    if (!patient) {
        const patientIdGen = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
        patient = await database_1.prisma.user.create({
            data: {
                phone,
                name,
                age: age ? parseInt(age) : null,
                role: constants_1.USER_ROLES.PATIENT,
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
    const count = await database_1.prisma.appointment.count({
        where: {
            doctorId,
            appointmentDate: { gte: startOfDay, lt: endOfDay },
            bookingMode: 'PHYSICAL',
        }
    });
    const tokenNumber = count + 1; // Sequential token
    const actualFee = fee ? parseFloat(fee) : 300; // fallback if not provided
    let validStaffBranchId = null;
    if (staff.branch) {
        const existingBranch = await database_1.prisma.branch.findFirst({
            where: {
                OR: [
                    { id: staff.branch },
                    { name: { equals: staff.branch, mode: 'insensitive' } },
                    { title: { contains: staff.branch, mode: 'insensitive' } },
                    { city: { equals: staff.branch, mode: 'insensitive' } }
                ]
            }
        });
        if (existingBranch) {
            validStaffBranchId = existingBranch.id;
        }
    }
    if (!validStaffBranchId) {
        const firstBranch = await database_1.prisma.branch.findFirst();
        if (firstBranch) {
            validStaffBranchId = firstBranch.id;
        }
    }
    const appointment = await database_1.prisma.appointment.create({
        data: {
            patientId: patient.id,
            doctorId,
            branchId: validStaffBranchId,
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
    res.status(constants_1.HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Walk-in Appointment Booked successfully',
        data: { appointment, patient }
    });
});
/**
 * Update Appointment Status (e.g., Mark IN_PROGRESS or COMPLETED)
 */
exports.updateAppointmentStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const staffId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        throw new AppError_1.AppError('Status is required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const staff = await database_1.prisma.user.findUnique({ where: { id: staffId } });
    if (!staff || !staff.branch) {
        throw new AppError_1.AppError('Staff is not assigned to any branch', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const appointment = await database_1.prisma.appointment.findFirst({
        where: { id, branchId: staff.branch }
    });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found in your branch', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    const updatedAppointment = await database_1.prisma.appointment.update({
        where: { id },
        data: { status }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Status updated successfully',
        data: { appointment: updatedAppointment }
    });
});
//# sourceMappingURL=staff.controller.js.map