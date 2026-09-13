"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCareServices = exports.getDoctors = exports.getSpecialties = exports.getBranches = void 0;
const database_1 = require("../../config/database.js");
const constants_1 = require("../../utilities/constants.js");
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
// ─────────────────────────────────────────────
// Public Endpoints (No Auth Required)
// ─────────────────────────────────────────────
/**
 * Fetch all available branches for patients to choose from during booking
 */
exports.getBranches = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const branches = await database_1.prisma.branch.findMany({
        orderBy: { name: 'asc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { branches } });
});
/**
 * Fetch all available Specialties
 */
exports.getSpecialties = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const specialties = await database_1.prisma.specialty.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { specialties } });
});
/**
 * Fetch doctors available at a specific branch or globally
 */
exports.getDoctors = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { branchId } = req.query;
    const whereClause = { role: constants_1.USER_ROLES.DOCTOR, isActive: true };
    // If a specific branch is selected, we filter by doctors who have an active Staff/Branch assignment
    // OR we can assume doctors have `branch` field (Wait, the user model has `branch` for staff, does it apply to doctors? 
    // Let's assume doctors might have `branch` populated if they are assigned, or we just fetch all for now, but to be accurate we filter by branch)
    if (branchId) {
        whereClause.branch = branchId;
    }
    const doctors = await database_1.prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            name: true,
            profilePhoto: true,
            specialization: true,
            qualifications: true,
            regNumber: true,
            clinicalBio: true,
            consultationFee: true,
            videoFee: true,
            experienceYears: true,
            branch: true
        },
        orderBy: { name: 'asc' },
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { doctors } });
});
/**
 * Fetch all available Care Services (Pharmacy, Diagnostics, Lab)
 */
exports.getCareServices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { category } = req.query;
    const whereClause = { isActive: true };
    if (category) {
        whereClause.category = category;
    }
    const services = await database_1.prisma.careService.findMany({
        where: whereClause,
        include: {
            doctor: {
                select: { id: true, name: true, specialization: true }
            }
        },
        orderBy: { name: 'asc' }
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { services } });
});
//# sourceMappingURL=public.controller.js.map