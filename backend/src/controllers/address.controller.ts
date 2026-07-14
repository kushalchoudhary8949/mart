import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export const getAddresses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  const mapped = addresses.map(addr => ({
    id: addr.id,
    user_id: addr.userId,
    label: addr.label,
    full_address: addr.fullAddress,
    lat: addr.lat,
    lng: addr.lng,
    is_default: addr.isDefault ? 1 : 0,
    created_at: addr.createdAt
  }));

  res.status(HTTP_STATUS.OK).json({ success: true, data: { addresses: mapped } });
});

export const addAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { label, full_address, lat, lng, is_default } = req.body;

  if (!full_address) {
    throw new AppError('full_address is required', HTTP_STATUS.BAD_REQUEST);
  }

  const hasAddress = await prisma.address.count({ where: { userId } });
  const isDefault = is_default ? true : hasAddress === 0;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      label: label || 'Home',
      fullAddress: full_address,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      isDefault
    }
  });

  res.status(HTTP_STATUS.CREATED).json({ success: true, data: { id: address.id } });
});

export const getAddressDetail = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  const address = await prisma.address.findFirst({
    where: { id, userId }
  });

  if (!address) {
    throw new AppError('Address not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      address: {
        id: address.id,
        user_id: address.userId,
        label: address.label,
        full_address: address.fullAddress,
        lat: address.lat,
        lng: address.lng,
        is_default: address.isDefault ? 1 : 0,
        created_at: address.createdAt
      }
    }
  });
});

export const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const { label, full_address, lat, lng, is_default } = req.body;

  const existing = await prisma.address.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new AppError('Address not found', HTTP_STATUS.NOT_FOUND);
  }

  const isDefault = is_default !== undefined ? (is_default ? true : false) : undefined;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  await prisma.address.update({
    where: { id },
    data: {
      label: label !== undefined ? label : undefined,
      fullAddress: full_address !== undefined ? full_address : undefined,
      lat: lat !== undefined ? (lat ? Number(lat) : null) : undefined,
      lng: lng !== undefined ? (lng ? Number(lng) : null) : undefined,
      isDefault
    }
  });

  res.status(HTTP_STATUS.OK).json({ success: true });
});

export const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  await prisma.address.deleteMany({
    where: { id, userId }
  });

  res.status(HTTP_STATUS.OK).json({ success: true });
});
