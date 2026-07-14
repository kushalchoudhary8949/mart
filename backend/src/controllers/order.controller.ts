import { OrderStatus, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { catchAsync } from '../middlewares/asyncWrapper';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';
import { validateCouponCode } from './coupon.controller';
import { emitOrderEvent, emitStockUpdate } from '../socket';

const terminal = new Set<OrderStatus>([OrderStatus.CANCELLED, OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED]);
const statusNames: Record<OrderStatus, string> = { PENDING: 'placed', ACCEPTED: 'confirmed', PACKING: 'preparing', READY_FOR_PICKUP: 'preparing', OUT_FOR_DELIVERY: 'out_for_delivery', DELIVERED: 'delivered', CANCELLED: 'cancelled', FAILED: 'failed', RETURNED: 'returned' };
const orderInclude = { items: true, history: { orderBy: { createdAt: 'asc' as const } }, user: { select: { name: true, phone: true } }, deliveryPartner: { include: { user: { select: { id: true, name: true, phone: true } } } } } satisfies Prisma.OrderInclude;
const mapOrder = (order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>) => ({ order: { ...order, order_no: order.orderNo, address_text: order.addressText, delivery_fee: order.deliveryFee, coupon_code: order.couponCode, placed_at: order.placedAt }, items: order.items });

export const checkout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { address_id, address_text, coupon_code, payment_method = 'COD' } = req.body;
  const result = await prisma.$transaction(async (tx) => {
    const cart = await tx.cartItem.findMany({ where: { userId }, include: { product: true } });
    if (!cart.length) throw new AppError('Your cart is empty.', HTTP_STATUS.BAD_REQUEST);
    const address = address_id ? await tx.address.findFirst({ where: { id: Number(address_id), userId } }) : null;
    const addressText = address?.fullAddress ?? address_text;
    if (!addressText) throw new AppError('A delivery address is required.', HTTP_STATUS.BAD_REQUEST);
    for (const item of cart) if (!item.product.isActive || item.product.stock < item.quantity) throw new AppError(`${item.product.name} is out of stock.`, HTTP_STATUS.CONFLICT);
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0; let offerId: number | undefined;
    if (coupon_code) { const coupon = await validateCouponCode(coupon_code, subtotal); discount = coupon.discount; offerId = coupon.offer.id; }
    const deliveryFee = subtotal - discount >= 499 ? 0 : 25;
    const order = await tx.order.create({ data: { orderNo: `VM${Date.now()}${Math.floor(Math.random() * 1000)}`, userId, subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee, couponCode: coupon_code?.trim().toUpperCase() || null, paymentMethod: String(payment_method).toUpperCase(), addressText, items: { create: cart.map(({ product, productId, quantity }) => ({ productId, name: product.name, image: product.thumbnail, unit: product.unit, price: product.price, quantity })) }, history: { create: { status: OrderStatus.PENDING, note: 'Order placed' } } }, include: orderInclude });
    for (const item of cart) {
      const updated = await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      await tx.inventoryHistory.create({ data: { productId: item.productId, previousQuantity: item.product.stock, updatedQuantity: updated.stock, difference: -item.quantity, reason: `Order ${order.orderNo}`, adminUserId: userId } });
    }
    if (offerId) await tx.offer.update({ where: { id: offerId }, data: { usedCount: { increment: 1 } } });
    await tx.cartItem.deleteMany({ where: { userId } });
    await tx.notification.create({ data: { userId, title: 'Order placed', message: `Your order ${order.orderNo} has been placed.`, type: 'order', orderId: order.id } });
    return { order, affected: cart.map((item) => ({ id: item.productId, stock: item.product.stock - item.quantity })) };
  });
  result.affected.forEach(emitStockUpdate);
  emitOrderEvent('orderPlaced', result.order);
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: { order: mapOrder(result.order).order } });
});

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user!.id }, include: orderInclude, orderBy: { placedAt: 'desc' } });
  res.status(HTTP_STATUS.OK).json({ success: true, data: { orders: orders.map((order) => mapOrder(order).order) } });
});
async function ownedOrder(id: number, userId: number) { const order = await prisma.order.findFirst({ where: { id, userId }, include: orderInclude }); if (!order) throw new AppError('Order not found.', HTTP_STATUS.NOT_FOUND); return order; }
export const getOrder = catchAsync(async (req: Request, res: Response) => res.status(HTTP_STATUS.OK).json({ success: true, data: mapOrder(await ownedOrder(Number(req.params.id), req.user!.id)) }));
export const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await ownedOrder(Number(req.params.id), req.user!.id); const status = statusNames[order.status];
  const steps = [['placed', 'Order placed'], ['confirmed', 'Order confirmed'], ['preparing', 'Preparing your order'], ['out_for_delivery', 'On the way'], ['delivered', 'Delivered']].map(([key, label], index) => ({ status: key, label, completed: index <= ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(status) }));
  const location = order.deliveryPartner ? { latitude: order.deliveryPartner.currentLatitude, longitude: order.deliveryPartner.currentLongitude } : null;
  res.status(HTTP_STATUS.OK).json({ success: true, data: { status, minutes_remaining: terminal.has(order.status) ? 0 : order.etaMinutes, progress_percent: Math.max(0, steps.findIndex((step) => step.status === status) * 25), steps, history: order.history, delivery_location: location } });
});
export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await ownedOrder(Number(req.params.id), req.user!.id);
  if (!(new Set<OrderStatus>([OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PACKING])).has(order.status)) throw new AppError('This order can no longer be cancelled.', HTTP_STATUS.CONFLICT);
  const updated = await prisma.$transaction(async (tx) => { const next = await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED, cancelledAt: new Date(), history: { create: { status: OrderStatus.CANCELLED, note: 'Cancelled by customer' } } }, include: orderInclude }); for (const item of order.items) if (item.productId) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } }); await tx.notification.create({ data: { userId: order.userId, title: 'Order cancelled', message: `Your order ${order.orderNo} was cancelled.`, type: 'order', orderId: order.id } }); return next; });
  emitOrderEvent('orderCancelled', updated); res.status(HTTP_STATUS.OK).json({ success: true, data: { order: mapOrder(updated).order } });
});
export const reorder = catchAsync(async (req: Request, res: Response) => { const order = await ownedOrder(Number(req.params.id), req.user!.id); for (const item of order.items) if (item.productId) await prisma.cartItem.upsert({ where: { userId_productId: { userId: req.user!.id, productId: item.productId } }, create: { userId: req.user!.id, productId: item.productId, quantity: item.quantity }, update: { quantity: { increment: item.quantity } } }); res.status(HTTP_STATUS.OK).json({ success: true }); });
export const rateOrder = catchAsync(async (req: Request, res: Response) => { const order = await ownedOrder(Number(req.params.id), req.user!.id); const rating = Number(req.body.rating); if (order.status !== OrderStatus.DELIVERED || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new AppError('A delivered order can be rated from 1 to 5.', HTTP_STATUS.BAD_REQUEST); await prisma.order.update({ where: { id: order.id }, data: { rating, review: req.body.comment?.trim() || null } }); res.status(HTTP_STATUS.OK).json({ success: true }); });
