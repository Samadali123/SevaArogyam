"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCareService = exports.updateCareService = exports.getMyCareServices = exports.createCareService = exports.joinVideoCall = exports.downloadPrescription = exports.writePrescription = exports.updateStatus = exports.getPatientQueue = void 0;
const database_1 = require("../../config/database.js");
const AppError_1 = require("../../errors/AppError.js");
const errorCodes_1 = require("../../errors/errorCodes.js");
const constants_1 = require("../../utilities/constants.js");
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
const pdf_1 = require("../../utilities/pdf.js");
const livekit_server_sdk_1 = require("livekit-server-sdk");
/**
 * Fetch patient queues for the doctor (ALL, WAITING, IN_PROGRESS, COMPLETED)
 */
exports.getPatientQueue = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { status, date } = req.query;
    const whereClause = { doctorId };
    if (status && typeof status === 'string' && status !== 'ALL') {
        // Mapping 'WAITING' from frontend to 'CONFIRMED' in DB (since pending means unbooked/unpaid)
        if (status === 'WAITING') {
            whereClause.status = 'CONFIRMED';
        }
        else {
            whereClause.status = status;
        }
    }
    else {
        // If 'ALL', we generally only want CONFIRMED, IN_PROGRESS, COMPLETED
        whereClause.status = { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] };
    }
    // Filter by date (defaults to today if not provided, or fetches all if explicitly requested)
    if (date) {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        whereClause.appointmentDate = { gte: startOfDay, lte: endOfDay };
    }
    const appointments = await database_1.prisma.appointment.findMany({
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
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { appointments } });
});
/**
 * Update the status of an appointment (e.g. IN_PROGRESS or COMPLETED)
 */
exports.updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    const appointment = await database_1.prisma.appointment.findFirst({ where: { id, doctorId } });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    const updatedAppointment = await database_1.prisma.appointment.update({
        where: { id },
        data: { status: status }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { appointment: updatedAppointment } });
});
/**
 * Write/Save a prescription for the patient
 */
exports.writePrescription = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { id } = req.params;
    // req.body should contain { diagnosis, medicines, investigations, examinationNotes, advice }
    const prescriptionData = req.body;
    const appointment = await database_1.prisma.appointment.findFirst({ where: { id, doctorId } });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    const updatedAppointment = await database_1.prisma.appointment.update({
        where: { id },
        data: { prescription: prescriptionData }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', message: 'Prescription saved successfully', data: { appointment: updatedAppointment } });
});
/**
 * Download Prescription as PDF
 */
exports.downloadPrescription = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { id } = req.params;
    const appointment = await database_1.prisma.appointment.findFirst({
        where: { id, doctorId },
        include: { patient: true, doctor: true, branch: true }
    });
    if (!appointment)
        throw new AppError_1.AppError('Appointment not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    // This will pipe the PDF to the response
    (0, pdf_1.generatePrescriptionPDF)(appointment, res);
});
/**
 * Generate a LiveKit Token for the Doctor to join the Video Room
 */
exports.joinVideoCall = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { id } = req.params;
    const appointment = await database_1.prisma.appointment.findFirst({
        where: { id, doctorId, bookingMode: 'VIRTUAL' },
        include: { doctor: true }
    });
    if (!appointment)
        throw new AppError_1.AppError('Virtual appointment not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    const roomName = appointment.id;
    const participantName = `Dr. ${appointment.doctor.name}`;
    const at = new livekit_server_sdk_1.AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: doctorId, name: participantName });
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, roomAdmin: true });
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
// Care Services (Pharmacy, Diagnostics, Lab)
// ─────────────────────────────────────────────
exports.createCareService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { name, description, category, price } = req.body;
    if (!name || !category || !price) {
        throw new AppError_1.AppError('Name, category, and price are required', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const service = await database_1.prisma.careService.create({
        data: {
            doctorId,
            name,
            description,
            category,
            price: parseFloat(price)
        }
    });
    res.status(constants_1.HTTP_STATUS.CREATED).json({ status: 'success', data: { service } });
});
exports.getMyCareServices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { category } = req.query;
    const whereClause = { doctorId };
    if (category) {
        whereClause.category = category;
    }
    const services = await database_1.prisma.careService.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { services } });
});
exports.updateCareService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { id } = req.params;
    const { name, description, category, price, isActive } = req.body;
    const service = await database_1.prisma.careService.findFirst({ where: { id, doctorId } });
    if (!service)
        throw new AppError_1.AppError('Service not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    const updatedService = await database_1.prisma.careService.update({
        where: { id },
        data: {
            name,
            description,
            category,
            price: price ? parseFloat(price) : undefined,
            isActive: isActive !== undefined ? isActive : undefined
        }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { service: updatedService } });
});
exports.deleteCareService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.id;
    const { id } = req.params;
    const service = await database_1.prisma.careService.findFirst({ where: { id, doctorId } });
    if (!service)
        throw new AppError_1.AppError('Service not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    await database_1.prisma.careService.delete({ where: { id } });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', message: 'Service deleted successfully' });
});
//# sourceMappingURL=doctor.controller.js.map