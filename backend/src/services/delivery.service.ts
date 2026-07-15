import { OrderStatus, Role } from '@prisma/client';
import { redis } from '../config/redis';
import * as repo from '../repositories/delivery.repository';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '../utils/constants';
import { emitOrderEvent } from '../socket';
import { prisma } from '../config/database';

const terminal = new Set<OrderStatus>([OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED, OrderStatus.RETURNED]);
const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PACKING, OrderStatus.CANCELLED],
  [OrderStatus.PACKING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED],
};

function eventFor(status: OrderStatus) {
  return ({ ACCEPTED: 'orderAccepted', PACKING: 'packingStarted', READY_FOR_PICKUP: 'readyForPickup', OUT_FOR_DELIVERY: 'outForDelivery', DELIVERED: 'orderDelivered', CANCELLED: 'orderCancelled' } as Partial<Record<OrderStatus, string>>)[status];
}

function timestampData(status: OrderStatus) {
  const now = new Date();
  if (status === OrderStatus.ACCEPTED) return { acceptedAt: now };
  if (status === OrderStatus.PACKING) return { packedAt: now };
  if (status === OrderStatus.READY_FOR_PICKUP) return { readyForPickupAt: now };
  if (status === OrderStatus.OUT_FOR_DELIVERY) return { outForDeliveryAt: now };
  if (status === OrderStatus.DELIVERED) return { deliveredAt: now };
  if (status === OrderStatus.CANCELLED) return { cancelledAt: now };
  return {};
}

async function partnerFor(userId: number) {
  const partner = await repo.findPartnerByUserId(userId);
  if (!partner || !partner.user.isActive) throw new AppError('Delivery partner profile not found or inactive.', HTTP_STATUS.FORBIDDEN);
  
  if (!partner.isAvailable) {
    const activeCount = await prisma.order.count({
      where: {
        deliveryPartnerId: partner.id,
        status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED, OrderStatus.RETURNED] }
      }
    });
    if (activeCount === 0) {
      await repo.updatePartner(partner.id, { isAvailable: true });
      return { ...partner, isAvailable: true };
    }
  }
  
  return partner;
}

async function requireOrder(id: number) {
  const order = await repo.findOrder(id);
  if (!order) throw new AppError('Order not found.', HTTP_STATUS.NOT_FOUND);
  return order;
}

export async function deliveryLogin(phone: string, password: string) {
  const { loginWithCredentials } = await import('./auth.service');
  const result = await loginWithCredentials(phone, password);
  if (result.user.role !== Role.DELIVERY_PARTNER) throw new AppError('This account is not a delivery partner.', HTTP_STATUS.FORBIDDEN);
  const partner = await partnerFor(result.user.id);
  await repo.updatePartner(partner.id, { isOnline: true });
  return { ...result, deliveryPartner: partner };
}

export async function getProfile(userId: number) { return partnerFor(userId); }
export async function updateProfile(userId: number, data: { name?: string; vehicleType?: string; vehicleNumber?: string; profileImage?: string; isAvailable?: boolean }) {
  const partner = await partnerFor(userId);
  return repo.updatePartner(partner.id, data);
}
export async function availableOrders() { return repo.listAvailableOrders(); }
export async function myOrders(userId: number, completed: boolean) { const partner = await partnerFor(userId); return repo.listPartnerOrders(partner.id, completed); }

export async function acceptOrder(userId: number, orderId: number) {
  const partner = await partnerFor(userId);
  if (!partner.isAvailable || !partner.isOnline) throw new AppError('You must be online and available to accept orders.', HTTP_STATUS.CONFLICT);
  const order = await requireOrder(orderId);
  const acceptableStatuses: OrderStatus[] = [OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.READY_FOR_PICKUP];
  if (!acceptableStatuses.includes(order.status) || order.deliveryPartnerId) throw new AppError('This order is no longer available.', HTTP_STATUS.CONFLICT);
  const updated = await repo.updateOrderWithHistory(orderId, order.status, { deliveryPartner: { connect: { id: partner.id } } });
  await repo.updatePartner(partner.id, { isAvailable: false });
  emitOrderEvent('deliveryAccepted', updated);
  emitOrderEvent('deliveryAssigned', updated);
  return updated;
}

export async function rejectOrder(userId: number, orderId: number) {
  await partnerFor(userId);
  const order = await requireOrder(orderId);
  if (order.status !== OrderStatus.READY_FOR_PICKUP || order.deliveryPartnerId) throw new AppError('This order is no longer available.', HTTP_STATUS.CONFLICT);
  return { rejected: true, orderId };
}

export async function deliveryTransition(userId: number, orderId: number, action: 'picked-up' | 'start' | 'delivered') {
  const partner = await partnerFor(userId);
  const order = await requireOrder(orderId);
  if (order.deliveryPartnerId !== partner.id) throw new AppError('Order is not assigned to you.', HTTP_STATUS.FORBIDDEN);
  const status = action === 'start' ? OrderStatus.OUT_FOR_DELIVERY : action === 'delivered' ? OrderStatus.DELIVERED : OrderStatus.READY_FOR_PICKUP;
  if (action === 'picked-up') {
    if (order.status !== OrderStatus.READY_FOR_PICKUP) throw new AppError('Only ready orders can be picked up.', HTTP_STATUS.CONFLICT);
    const updated = await repo.updateOrder(orderId, { pickedUpAt: new Date() });
    emitOrderEvent('pickedUp', updated);
    return updated;
  }
  if (!transitions[order.status]?.includes(status)) throw new AppError(`Cannot change ${order.status} to ${status}.`, HTTP_STATUS.CONFLICT);
  const updated = await repo.updateOrderWithHistory(orderId, status, timestampData(status));
  if (status === OrderStatus.DELIVERED) await repo.updatePartner(partner.id, { isAvailable: true });
  emitOrderEvent(eventFor(status)!, updated);
  return updated;
}

export async function updateLocation(userId: number, orderId: number, latitude: number, longitude: number) {
  const partner = await partnerFor(userId);
  const order = await requireOrder(orderId);
  if (order.deliveryPartnerId !== partner.id || terminal.has(order.status)) throw new AppError('Location update is not allowed for this order.', HTTP_STATUS.FORBIDDEN);
  await Promise.all([repo.updatePartner(partner.id, { currentLatitude: latitude, currentLongitude: longitude }), redis.set(`delivery:location:${orderId}`, JSON.stringify({ latitude, longitude, updatedAt: new Date().toISOString() }), 'EX', 120)]);
  const payload = { orderId, latitude, longitude, updatedAt: new Date().toISOString() };
  emitOrderEvent('locationUpdated', { ...order, id: orderId });
  return payload;
}

export async function adminUpdateOrderStatus(orderId: number, status: OrderStatus) {
  const order = await requireOrder(orderId);
  const updated = await repo.updateOrderWithHistory(orderId, status, timestampData(status));
  const event = eventFor(status); if (event) emitOrderEvent(event, updated);
  return updated;
}

export async function assignPartner(orderId: number, partnerId: number) {
  const order = await requireOrder(orderId); const partner = await repo.findPartnerById(partnerId);
  if (!partner) throw new AppError('Delivery partner not found.', HTTP_STATUS.NOT_FOUND);
  const assignableStatuses: OrderStatus[] = [OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.READY_FOR_PICKUP];
  if (!assignableStatuses.includes(order.status) || order.deliveryPartnerId) throw new AppError('Only unassigned confirmed orders can be assigned.', HTTP_STATUS.CONFLICT);
  const updated = await repo.updateOrderWithHistory(orderId, order.status, { deliveryPartner: { connect: { id: partnerId } } });
  await repo.updatePartner(partnerId, { isAvailable: false }); emitOrderEvent('deliveryAssigned', updated); return updated;
}

export async function adminOrders(query: { status?: OrderStatus; search?: string; page: number; limit: number }) {
  const [orders, total] = await repo.listOrders({ status: query.status, search: query.search, skip: (query.page - 1) * query.limit, take: query.limit });
  return { orders, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}
export async function deliveryReport() {
  const partners = await repo.listPartners();
  const completed = await Promise.all(partners.map(async (p) => ({ partner: p, orders: await repo.listPartnerOrders(p.id, true) })));
  return completed.map(({ partner, orders }) => ({ partner, completedOrders: orders.filter((o) => o.status === OrderStatus.DELIVERED).length, earnings: orders.filter((o) => o.status === OrderStatus.DELIVERED).reduce((sum, o) => sum + o.total, 0), rating: partner.rating }));
}
