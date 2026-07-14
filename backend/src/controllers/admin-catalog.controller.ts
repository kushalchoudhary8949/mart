import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import * as adminService from '../services/admin-catalog.service';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';
import { emitStockUpdate } from '../socket';

function parseResourceId(value: string, resource: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError(`${resource} ID must be a positive integer.`, HTTP_STATUS.BAD_REQUEST);
  }
  return id;
}

// ─── Admin Categories CRUD ───────────────────────────────────────────────────

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminService.getAdminCategories();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createCategory(req.body);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: result,
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const id = parseResourceId(req.params.id, 'Category');
  const result = await adminService.updateCategory(id, req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = parseResourceId(req.params.id, 'Category');
  const result = await adminService.deleteCategory(id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── Admin Products CRUD ─────────────────────────────────────────────────────

export const getProducts = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminService.getAdminProducts();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createProduct(req.body);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: result,
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const id = parseResourceId(req.params.id, 'Product');
  const result = await adminService.updateProduct(id, req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const id = parseResourceId(req.params.id, 'Product');
  const result = await adminService.deactivateProduct(id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const adjustStock = catchAsync(async (req: Request, res: Response) => {
  const productId = parseResourceId(req.params.id, 'Product');
  const { quantity, reason } = req.body;
  const product = await prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({ where: { id: productId } });
    if (!current) throw new AppError('Product not found.', HTTP_STATUS.NOT_FOUND);
    const updated = await tx.product.update({ where: { id: productId }, data: { stock: quantity } });
    await tx.inventoryHistory.create({ data: { productId, previousQuantity: current.stock, updatedQuantity: quantity, difference: quantity - current.stock, reason, adminUserId: req.user!.id } });
    return updated;
  });
  emitStockUpdate({ id: product.id, stock: product.stock });
  res.status(HTTP_STATUS.OK).json({ success: true, data: { product } });
});

export const getCustomers = catchAsync(async (_req, res) => {
  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, include: { orders: { select: { total: true } } }, orderBy: { createdAt: 'desc' } });
  res.status(HTTP_STATUS.OK).json({ success: true, data: { customers: users.map(({ orders, passwordHash, ...user }) => ({ ...user, orders: orders.length, totalSpent: orders.reduce((sum, order) => sum + order.total, 0) })) } });
});

export const getKpis = catchAsync(async (_req, res) => {
  const [orders, customers, products, pending] = await Promise.all([prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { status: { not: 'CANCELLED' } } }), prisma.user.count({ where: { role: 'CUSTOMER' } }), prisma.product.count({ where: { isActive: true } }), prisma.order.count({ where: { status: { in: ['PENDING', 'ACCEPTED', 'PACKING'] } } })]);
  res.status(HTTP_STATUS.OK).json({ success: true, data: { totalSales: orders._sum.total ?? 0, totalOrders: orders._count, customers, products, pendingOrders: pending } });
});

export const getOffers = catchAsync(async (_req, res) => res.status(HTTP_STATUS.OK).json({ success: true, data: { offers: await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } }) } }));
export const createOffer = catchAsync(async (req, res) => {
  const { start_date, end_date, buy_qty, get_qty, usage_limit, min_cart_value, is_active, ...offer } = req.body;
  const created = await prisma.offer.create({ data: { ...offer, startDate: new Date(start_date), endDate: new Date(end_date), buyQty: buy_qty, getQty: get_qty, usageLimit: usage_limit, minCartValue: min_cart_value, isActive: is_active } });
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: { offer: created } });
});
export const updateOffer = catchAsync(async (req, res) => {
  const id = parseResourceId(req.params.id, 'Offer'); const body = req.body;
  const offer = await prisma.offer.update({ where: { id }, data: { ...body, startDate: body.start_date ? new Date(body.start_date) : undefined, endDate: body.end_date ? new Date(body.end_date) : undefined, buyQty: body.buy_qty, getQty: body.get_qty, usageLimit: body.usage_limit, minCartValue: body.min_cart_value, isActive: body.is_active } });
  res.status(HTTP_STATUS.OK).json({ success: true, data: { offer } });
});
export const deleteOffer = catchAsync(async (req, res) => { await prisma.offer.delete({ where: { id: parseResourceId(req.params.id, 'Offer') } }); res.status(HTTP_STATUS.OK).json({ success: true }); });

// ─── Admin Banners CRUD ──────────────────────────────────────────────────────

export const getBanners = catchAsync(async (_req: Request, res: Response) => {
  const result = await adminService.getAdminBanners();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const createBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.createBanner(req.body);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: result,
  });
});

export const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const id = parseResourceId(req.params.id, 'Banner');
  const result = await adminService.updateBanner(id, req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const id = parseResourceId(req.params.id, 'Banner');
  const result = await adminService.deleteBanner(id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});
