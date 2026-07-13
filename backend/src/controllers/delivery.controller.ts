import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import * as delivery from '../services/delivery.service';

const id = (req: Request) => Number(req.params.id);
const respond = (res: Response, data: unknown, status = HTTP_STATUS.OK) => res.status(status).json({ success: true, data });
export const login = catchAsync(async (req, res) => respond(res, await delivery.deliveryLogin(req.body.phone, req.body.password)));
export const profile = catchAsync(async (req, res) => respond(res, await delivery.getProfile(req.user!.id)));
export const updateProfile = catchAsync(async (req, res) => respond(res, await delivery.updateProfile(req.user!.id, req.body)));
export const available = catchAsync(async (_req, res) => respond(res, await delivery.availableOrders()));
export const mine = catchAsync(async (req, res) => respond(res, await delivery.myOrders(req.user!.id, req.query.completed === 'true')));
export const accept = catchAsync(async (req, res) => respond(res, await delivery.acceptOrder(req.user!.id, id(req))));
export const reject = catchAsync(async (req, res) => respond(res, await delivery.rejectOrder(req.user!.id, id(req))));
export const pickedUp = catchAsync(async (req, res) => respond(res, await delivery.deliveryTransition(req.user!.id, id(req), 'picked-up')));
export const start = catchAsync(async (req, res) => respond(res, await delivery.deliveryTransition(req.user!.id, id(req), 'start')));
export const delivered = catchAsync(async (req, res) => respond(res, await delivery.deliveryTransition(req.user!.id, id(req), 'delivered')));
export const location = catchAsync(async (req, res) => respond(res, await delivery.updateLocation(req.user!.id, id(req), req.body.latitude, req.body.longitude)));
