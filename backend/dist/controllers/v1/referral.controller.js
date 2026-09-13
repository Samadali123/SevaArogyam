"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralDashboard = void 0;
const database_1 = require("../../config/database.js");
const AppError_1 = require("../../errors/AppError.js");
const errorCodes_1 = require("../../errors/errorCodes.js");
const constants_1 = require("../../utilities/constants.js");
const asyncHandler_1 = require("../../utilities/asyncHandler.js");
/**
 * Fetch the user's referral dashboard stats
 */
exports.getReferralDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    let user = await database_1.prisma.user.findUnique({
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
    if (!user)
        throw new AppError_1.AppError('User not found', constants_1.HTTP_STATUS.NOT_FOUND, errorCodes_1.ERROR_CODES.NOT_FOUND, true);
    // Auto-generate referral code if not present
    if (!user.referralCode) {
        const code = `SEVA-${user.name.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
        // Check if it exists (very basic handling, in prod should loop or use UUID piece)
        const existing = await database_1.prisma.user.findUnique({ where: { referralCode: code } });
        const finalCode = existing ? `${code}${Math.floor(Math.random() * 10)}` : code;
        user = await database_1.prisma.user.update({
            where: { id: userId },
            data: { referralCode: finalCode },
            include: {
                _count: { select: { referrals: true } },
                coupons: { where: { isActive: true, isUsed: false } }
            }
        });
    }
    res.status(constants_1.HTTP_STATUS.OK).json({
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
//# sourceMappingURL=referral.controller.js.map