import { z } from 'zod';

const id = z.coerce.number().int().positive();
export const deliveryLoginSchema = z.object({ phone: z.string().trim().min(8).max(20), password: z.string().min(8).max(128) });
export const profileSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), vehicleType: z.string().trim().min(2).max(50).optional(), vehicleNumber: z.string().trim().min(3).max(30).optional(), profileImage: z.string().url().optional(), isAvailable: z.boolean().optional() }).refine((data) => Object.keys(data).length > 0, 'At least one field is required.');
export const locationSchema = z.object({ latitude: z.number().gte(-90).lte(90), longitude: z.number().gte(-180).lte(180) });
export const idParamsSchema = z.object({ id });
export const partnerSchema = z.object({ userId: id.optional(), phone: z.string().trim().min(8).max(20), name: z.string().trim().min(2).max(100), password: z.string().min(8).max(128).optional(), vehicleType: z.string().trim().min(2).max(50), vehicleNumber: z.string().trim().min(3).max(30), profileImage: z.string().url().optional(), isAvailable: z.boolean().optional() });
export const partnerUpdateSchema = partnerSchema.omit({ userId: true, phone: true }).partial().extend({ isOnline: z.boolean().optional(), isAvailable: z.boolean().optional() });
export const assignSchema = z.object({ partnerId: id });
export const statusSchema = z.object({ status: z.enum(['PENDING', 'ACCEPTED', 'PACKING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED', 'RETURNED']) });
export const adminOrdersQuerySchema = z.object({ status: statusSchema.shape.status.optional(), search: z.string().trim().max(100).optional(), page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
