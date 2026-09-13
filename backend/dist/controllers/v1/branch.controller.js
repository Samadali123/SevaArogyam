"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.getBranchById = exports.searchBranches = exports.getBranches = exports.createBranch = void 0;
const database_1 = require("../../config/database.js");
const AppError_1 = require("../../errors/AppError.js");
const errorCodes_1 = require("../../errors/errorCodes.js");
const constants_1 = require("../../utilities/constants.js");
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
// ─────────────────────────────────────────────
// Branch Management (Admin Only)
// ─────────────────────────────────────────────
exports.createBranch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, title, city, receptionPhone, emergencyPhone, opdSlotInterval, address, operatingHours } = req.body;
    if (!name || !title || !city || !receptionPhone) {
        throw new AppError_1.AppError('Missing required branch fields', constants_1.HTTP_STATUS.BAD_REQUEST, errorCodes_1.ERROR_CODES.VALIDATION_ERROR, true);
    }
    const branch = await database_1.prisma.branch.create({
        data: {
            name,
            title,
            city,
            receptionPhone,
            emergencyPhone: emergencyPhone || '',
            opdSlotInterval: opdSlotInterval ? Number(opdSlotInterval) : 15,
            address: address || '',
            operatingHours: operatingHours || '',
        },
    });
    res.status(constants_1.HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Branch created successfully',
        data: { branch },
    });
});
exports.getBranches = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search } = req.query;
    const whereClause = {};
    if (search && typeof search === 'string') {
        whereClause.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
        ];
    }
    const branches = await database_1.prisma.branch.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
    });
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { branches } });
});
exports.searchBranches = exports.getBranches;
exports.getBranchById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const branch = await database_1.prisma.branch.findUnique({
        where: { id: req.params.id },
    });
    if (!branch) {
        throw new AppError_1.AppError('Branch not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    }
    res.status(constants_1.HTTP_STATUS.OK).json({ status: 'success', data: { branch } });
});
exports.updateBranch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, title, city, receptionPhone, emergencyPhone, opdSlotInterval, address, operatingHours } = req.body;
    const existingBranch = await database_1.prisma.branch.findUnique({ where: { id } });
    if (!existingBranch) {
        throw new AppError_1.AppError('Branch not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    }
    const updatedBranch = await database_1.prisma.branch.update({
        where: { id },
        data: {
            name, title, city, receptionPhone, emergencyPhone, address, operatingHours,
            opdSlotInterval: opdSlotInterval ? Number(opdSlotInterval) : existingBranch.opdSlotInterval,
        },
    });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Branch updated successfully',
        data: { branch: updatedBranch },
    });
});
exports.deleteBranch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingBranch = await database_1.prisma.branch.findUnique({ where: { id } });
    if (!existingBranch) {
        throw new AppError_1.AppError('Branch not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    }
    await database_1.prisma.branch.delete({ where: { id } });
    res.status(constants_1.HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Branch deleted successfully',
    });
});
//# sourceMappingURL=branch.controller.js.map