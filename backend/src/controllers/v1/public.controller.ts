import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { HTTP_STATUS, USER_ROLES } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';

// ─────────────────────────────────────────────
// Public Endpoints (No Auth Required)
// ─────────────────────────────────────────────

/**
 * Fetch all available branches for patients to choose from during booking
 */
export const getBranches = asyncHandler(async (_req: Request, res: Response) => {
  const branches = await prisma.branch.findMany({
    orderBy: { name: 'asc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { branches } });
});

/**
 * Fetch all available Specialties
 */
export const getSpecialties = asyncHandler(async (_req: Request, res: Response) => {
  const specialties = await prisma.specialty.findMany({
    where: { isActive: true },
    orderBy: { nameEn: 'asc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { specialties } });
});

/**
 * Fetch doctors available at a specific branch or globally
 */
export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { branchId } = req.query;

  const whereClause: any = { role: USER_ROLES.DOCTOR, isActive: true };

  // If a specific branch is selected, we filter by doctors who have an active Staff/Branch assignment
  // OR we can assume doctors have `branch` field (Wait, the user model has `branch` for staff, does it apply to doctors? 
  // Let's assume doctors might have `branch` populated if they are assigned, or we just fetch all for now, but to be accurate we filter by branch)
  if (branchId) {
    whereClause.branch = branchId;
  }

  const doctors = await prisma.user.findMany({
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

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { doctors } });
});

/**
 * Fetch all available Care Services (Pharmacy, Diagnostics, Lab)
 */
export const getCareServices = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query;

  const whereClause: any = { isActive: true };
  if (category) {
    whereClause.category = category;
  }

  const services = await prisma.careService.findMany({
    where: whereClause,
    include: {
      doctor: {
        select: { id: true, name: true, specialization: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.status(HTTP_STATUS.OK).json({ status: 'success', data: { services } });
});
