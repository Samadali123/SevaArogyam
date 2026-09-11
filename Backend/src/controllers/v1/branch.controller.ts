import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';

// ─────────────────────────────────────────────
// Branch Management (Admin Only)
// ─────────────────────────────────────────────

export const createBranch = asyncHandler(async (req: Request, res: Response) => {
  const { name, title, city, receptionPhone, emergencyPhone, opdSlotInterval, address, operatingHours } = req.body;

  if (!name || !title || !city || !receptionPhone) {
    throw new AppError('Missing required branch fields', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const branch = await prisma.branch.create({
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

  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    message: 'Branch created successfully',
    data: { branch },
  });
});

export const getBranches = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;

  const whereClause: any = {};
  if (search && typeof search === 'string') {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  const branches = await prisma.branch.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { branches } });
});

export const searchBranches = getBranches;

export const getBranchById = asyncHandler(async (req: Request, res: Response) => {
  const branch = await prisma.branch.findUnique({
    where: { id: req.params.id },
  });

  if (!branch) {
    throw new AppError('Branch not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { branch } });
});

export const updateBranch = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, title, city, receptionPhone, emergencyPhone, opdSlotInterval, address, operatingHours } = req.body;

  const existingBranch = await prisma.branch.findUnique({ where: { id } });
  if (!existingBranch) {
    throw new AppError('Branch not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: {
      name, title, city, receptionPhone, emergencyPhone, address, operatingHours,
      opdSlotInterval: opdSlotInterval ? Number(opdSlotInterval) : existingBranch.opdSlotInterval,
    },
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Branch updated successfully',
    data: { branch: updatedBranch },
  });
});

export const deleteBranch = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingBranch = await prisma.branch.findUnique({ where: { id } });
  if (!existingBranch) {
    throw new AppError('Branch not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  await prisma.branch.delete({ where: { id } });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Branch deleted successfully',
  });
});
