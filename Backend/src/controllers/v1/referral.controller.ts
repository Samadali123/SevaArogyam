import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';

/**
 * Fetch the user's referral dashboard stats
 */
export const getReferralDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { referrals: true }
      },
      coupons: {
        where: { isActive: true, isUsed: false }
      }
    }
  });

  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);

  // Auto-generate referral code if not present
  if (!user.referralCode) {
    const code = `SEVA-${user.name.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    
    // Check if it exists (very basic handling, in prod should loop or use UUID piece)
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    const finalCode = existing ? `${code}${Math.floor(Math.random() * 10)}` : code;

    user = await prisma.user.update({
      where: { id: userId },
      data: { referralCode: finalCode },
      include: {
        _count: { select: { referrals: true } },
        coupons: { where: { isActive: true, isUsed: false } }
      }
    });
  }

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      referralCode: user.referralCode,
      successfulReferrals: user._count.referrals,
      walletBalance: user.walletBalance,
      activeCoupons: user.coupons.length,
      coupons: user.coupons
    }
  });
});
