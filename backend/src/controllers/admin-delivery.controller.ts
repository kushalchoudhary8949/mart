import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import { prisma } from '../config/database';
import * as delivery from '../services/delivery.service';
import * as repo from '../repositories/delivery.repository';
import { AppError } from '../utils/AppError';

const id = (req: Request) => Number(req.params.id);
const response = (res: Response, data: unknown, status: number = HTTP_STATUS.OK) => res.status(status).json({ success: true, data });
export const orders = catchAsync(async (req, res) => response(res, await delivery.adminOrders(req.query as any)));
export const setStatus = catchAsync(async (req, res) => response(res, await delivery.adminUpdateOrderStatus(id(req), req.body.status)));
export const assign = catchAsync(async (req, res) => response(res, await delivery.assignPartner(id(req), req.body.partnerId)));
export const partners = catchAsync(async (_req, res) => response(res, await repo.listPartners()));
export const createPartner = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.body.userId } });
  if (!user) throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  if (user.role !== 'DELIVERY_PARTNER') throw new AppError('User must have DELIVERY_PARTNER role.', HTTP_STATUS.BAD_REQUEST);
  response(res, await repo.createPartner({ ...req.body, user: { connect: { id: req.body.userId } } }), HTTP_STATUS.CREATED);
});
export const updatePartner = catchAsync(async (req, res) => response(res, await repo.updatePartner(id(req), req.body)));
export const removePartner = catchAsync(async (req, res) => { await repo.deletePartner(id(req)); res.status(HTTP_STATUS.NO_CONTENT).send(); });
export const reports = catchAsync(async (_req, res) => response(res, await delivery.deliveryReport()));
export const location = catchAsync(async (req, res) => {
  const location = await (await import('../config/redis')).redis.get(`delivery:location:${id(req)}`);
  response(res, location ? JSON.parse(location) : null);
});
