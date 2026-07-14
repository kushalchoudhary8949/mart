import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } });
  res.status(HTTP_STATUS.OK).json({ success: true, data: { notifications, unread_count: notifications.filter((n) => !n.isRead).length } });
});
export const markRead = catchAsync(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { id: Number(req.params.id), userId: req.user!.id }, data: { isRead: true } });
  res.status(HTTP_STATUS.OK).json({ success: true });
});
export const markAllRead = catchAsync(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true } });
  res.status(HTTP_STATUS.OK).json({ success: true });
});
