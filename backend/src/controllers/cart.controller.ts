import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { config } from '../config';

function optimizeImageUrl(url: string | null | undefined, width = 400): string | null {
  if (!url) return null;
  if (url.startsWith('data:') || url.includes('wsrv.nl')) return url;
  if (config.env === 'development') return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=80&output=webp&default=placeholder`;
}

// Helper: Get cart details
async function getCartWithItems(userId: number) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const items = cartItems.map(ci => ({
    id: ci.id,
    quantity: ci.quantity,
    product_id: ci.productId,
    name: ci.product.name,
    slug: ci.product.slug,
    price: ci.product.price,
    mrp: ci.product.mrp,
    unit: ci.product.unit,
    image: optimizeImageUrl(ci.product.thumbnail ?? ci.product.images?.[0]?.url ?? null, 200),
    stock: ci.product.stock
  }));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);

  return {
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    total_items: totalItems
  };
}

export const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const cartData = await getCartWithItems(userId);
  res.status(HTTP_STATUS.OK).json({ success: true, data: cartData });
});

export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = Number(req.body.product_id);
  const quantity = Math.max(1, Number(req.body.quantity || 1));

  if (!productId) {
    throw new AppError('product_id is required', HTTP_STATUS.BAD_REQUEST);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || !product.isActive) {
    throw new AppError('Product not found or inactive', HTTP_STATUS.NOT_FOUND);
  }
  if (product.stock < 1) {
    throw new AppError('Product is out of stock', HTTP_STATUS.CONFLICT);
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  if (existing) {
    const newQty = Math.min(product.stock, existing.quantity + quantity);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity: Math.min(product.stock, quantity)
      }
    });
  }

  const cartData = await getCartWithItems(userId);
  res.status(HTTP_STATUS.OK).json({ success: true, data: cartData });
});

export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);

  if (!productId) {
    throw new AppError('Product ID is required', HTTP_STATUS.BAD_REQUEST);
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  if (!existing) {
    throw new AppError('Cart item not found', HTTP_STATUS.NOT_FOUND);
  }

  if (quantity < 1 || Number.isNaN(quantity)) {
    await prisma.cartItem.delete({
      where: { id: existing.id }
    });
  } else {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product || !product.isActive || product.stock < 1) throw new AppError('Product is out of stock', HTTP_STATUS.CONFLICT);
    const newQty = Math.min(product.stock, quantity);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty }
    });
  }

  const cartData = await getCartWithItems(userId);
  res.status(HTTP_STATUS.OK).json({ success: true, data: cartData });
});

export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = Number(req.params.productId);

  await prisma.cartItem.deleteMany({
    where: { userId, productId }
  });

  const cartData = await getCartWithItems(userId);
  res.status(HTTP_STATUS.OK).json({ success: true, data: cartData });
});

export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await prisma.cartItem.deleteMany({
    where: { userId }
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { items: [], subtotal: 0, total_items: 0 }
  });
});
