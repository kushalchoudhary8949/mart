import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { catchAsync } from '../middlewares/asyncWrapper';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';

export function discountFor(offer: { type: string; value: number }, subtotal: number) {
  return Math.min(subtotal, offer.type === 'PERCENTAGE' ? subtotal * (offer.value / 100) : offer.type === 'FLAT' ? offer.value : 0);
}

export const getCoupons = catchAsync(async (_req: Request, res: Response) => {
  const now = new Date();
  const offers = (await prisma.offer.findMany({ where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } }, orderBy: { endDate: 'asc' } })).filter((offer) => offer.usageLimit === null || offer.usedCount < offer.usageLimit);
  res.status(HTTP_STATUS.OK).json({ success: true, data: { coupons: offers.map((offer) => ({ ...offer, code: offer.code, min_cart_value: offer.minCartValue, end_date: offer.endDate })) } });
});

export async function validateCouponCode(code: string, subtotal: number) {
  const offer = await prisma.offer.findFirst({ where: { code: code.trim().toUpperCase(), isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } } });
  if (!offer || (offer.usageLimit !== null && offer.usedCount >= offer.usageLimit)) throw new AppError('Coupon is invalid or expired.', HTTP_STATUS.BAD_REQUEST);
  if (offer.minCartValue !== null && subtotal < offer.minCartValue) throw new AppError(`Minimum cart value is ₹${offer.minCartValue}.`, HTTP_STATUS.BAD_REQUEST);
  return { offer, discount: Math.round(discountFor(offer, subtotal) * 100) / 100 };
}

export const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const subtotal = Number(req.body.subtotal);
  if (!req.body.code || !Number.isFinite(subtotal) || subtotal < 0) throw new AppError('Valid code and subtotal are required.', HTTP_STATUS.BAD_REQUEST);
  const result = await validateCouponCode(req.body.code, subtotal);
  res.status(HTTP_STATUS.OK).json({ success: true, data: { coupon: result.offer, discount: result.discount, total: subtotal - result.discount } });
});
