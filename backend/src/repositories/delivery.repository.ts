import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const orderInclude = {
  user: { select: { id: true, name: true, phone: true } },
  items: true,
  deliveryPartner: { select: { id: true, userId: true, name: true, phone: true, vehicleType: true, vehicleNumber: true, rating: true } },
} satisfies Prisma.OrderInclude;

export function findPartnerByUserId(userId: number) {
  return prisma.deliveryPartner.findUnique({ where: { userId }, include: { user: { select: { id: true, phone: true, name: true, isActive: true } } } });
}

export function findPartnerById(id: number) {
  return prisma.deliveryPartner.findUnique({ where: { id } });
}

export function listPartners() {
  return prisma.deliveryPartner.findMany({
    include: { user: { select: { id: true, phone: true, isActive: true } }, _count: { select: { orders: true } } },
    orderBy: [{ isAvailable: 'desc' }, { name: 'asc' }],
  });
}

export function createPartner(data: Prisma.DeliveryPartnerCreateInput) {
  return prisma.deliveryPartner.create({ data });
}

export function updatePartner(id: number, data: Prisma.DeliveryPartnerUpdateInput) {
  return prisma.deliveryPartner.update({ where: { id }, data });
}

export function deletePartner(id: number) {
  return prisma.deliveryPartner.delete({ where: { id } });
}

export function findOrder(id: number) {
  return prisma.order.findUnique({ where: { id }, include: orderInclude });
}

export function listAvailableOrders() {
  return prisma.order.findMany({ where: { status: { in: [OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.READY_FOR_PICKUP] }, deliveryPartnerId: null }, include: orderInclude, orderBy: { placedAt: 'asc' } });
}

export function listPartnerOrders(partnerId: number, completed = false) {
  return prisma.order.findMany({
    where: completed
      ? { deliveryPartnerId: partnerId, status: { in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED, OrderStatus.RETURNED] } }
      : { deliveryPartnerId: partnerId, status: { in: [OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY] } },
    include: orderInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

export function updateOrder(id: number, data: Prisma.OrderUpdateInput) {
  return prisma.order.update({ where: { id }, data, include: orderInclude });
}

export async function updateOrderWithHistory(id: number, status: OrderStatus, data: Prisma.OrderUpdateInput) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({ where: { id }, data: { ...data, status }, include: orderInclude });
    await tx.orderStatusHistory.create({ data: { orderId: id, status } });
    return order;
  });
}

export function listOrders(filters: { status?: OrderStatus; search?: string; skip: number; take: number }) {
  const where: Prisma.OrderWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? { OR: [{ orderNo: { contains: filters.search, mode: 'insensitive' } }, { user: { name: { contains: filters.search, mode: 'insensitive' } } }, { user: { phone: { contains: filters.search } } }] } : {}),
  };
  return Promise.all([
    prisma.order.findMany({ where, include: orderInclude, orderBy: { placedAt: 'desc' }, skip: filters.skip, take: filters.take }),
    prisma.order.count({ where }),
  ]);
}
