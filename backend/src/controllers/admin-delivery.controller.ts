import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import { prisma } from '../config/database';
import * as delivery from '../services/delivery.service';
import * as repo from '../repositories/delivery.repository';
import { AppError } from '../utils/AppError';
import { hashPassword } from '../utils/password';

const id = (req: Request) => Number(req.params.id);
const response = (res: Response, data: unknown, status: number = HTTP_STATUS.OK) => res.status(status).json({ success: true, data });
export const orders = catchAsync(async (req, res) => response(res, await delivery.adminOrders(req.query as any)));
export const setStatus = catchAsync(async (req, res) => response(res, await delivery.adminUpdateOrderStatus(id(req), req.body.status)));
export const assign = catchAsync(async (req, res) => response(res, await delivery.assignPartner(id(req), req.body.partnerId)));
export const partners = catchAsync(async (_req, res) => response(res, await repo.listPartners()));
export const createPartner = catchAsync(async (req, res) => {
  const { userId, phone, name, password, vehicleType, vehicleNumber, profileImage, isAvailable } = req.body;

  let user;

  if (userId) {
    // Case 1: userId provided — use existing user
    user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  } else {
    // Case 2: Look up by phone
    user = await prisma.user.findUnique({ where: { phone } });
  }

  if (user) {
    // Upgrade role if needed
    if (user.role !== 'DELIVERY_PARTNER') {
      user = await prisma.user.update({ where: { id: user.id }, data: { role: 'DELIVERY_PARTNER', name: name || user.name } });
    }
    // Check if already a delivery partner
    const existing = await prisma.deliveryPartner.findUnique({ where: { userId: user.id } });
    if (existing) throw new AppError('This user is already a delivery partner.', HTTP_STATUS.CONFLICT);
  } else {
    // Case 3: Create new user
    if (!password) throw new AppError('Password is required when creating a new delivery partner.', HTTP_STATUS.BAD_REQUEST);
    const passwordHash = await hashPassword(password);
    user = await prisma.user.create({
      data: { phone, name, role: 'DELIVERY_PARTNER', passwordHash, isVerified: true },
    });
  }

  const partner = await repo.createPartner({
    phone,
    name,
    vehicleType,
    vehicleNumber,
    ...(profileImage ? { profileImage } : {}),
    ...(isAvailable !== undefined ? { isAvailable } : {}),
    user: { connect: { id: user.id } },
  });

  response(res, partner, HTTP_STATUS.CREATED);
});
export const updatePartner = catchAsync(async (req, res) => response(res, await repo.updatePartner(id(req), req.body)));
export const removePartner = catchAsync(async (req, res) => { await repo.deletePartner(id(req)); res.status(HTTP_STATUS.NO_CONTENT).send(); });
export const reports = catchAsync(async (_req, res) => response(res, await delivery.deliveryReport()));
export const location = catchAsync(async (req, res) => {
  const partnerId = id(req);
  const partner = await prisma.deliveryPartner.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, phone: true, vehicleType: true, vehicleNumber: true, isOnline: true, isAvailable: true, currentLatitude: true, currentLongitude: true },
  });
  if (!partner) throw new AppError('Delivery partner not found.', HTTP_STATUS.NOT_FOUND);

  // Try live location from Redis first
  let liveLocation = null;
  try {
    const redisData = await (await import('../config/redis')).redis.get(`delivery:location:${partnerId}`);
    if (redisData) liveLocation = JSON.parse(redisData);
  } catch { /* Redis unavailable, use DB fallback */ }

  response(res, {
    partner,
    location: liveLocation || (partner.currentLatitude != null ? { latitude: partner.currentLatitude, longitude: partner.currentLongitude, updatedAt: null } : null),
  });
});

