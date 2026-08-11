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

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const wishlistItems = await prisma.wishlistItem.findMany({
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

  const items = wishlistItems.map(wi => ({
    id: wi.product.id,
    name: wi.product.name,
    slug: wi.product.slug,
    price: wi.product.price,
    mrp: wi.product.mrp,
    unit: wi.product.unit,
    image: optimizeImageUrl(wi.product.thumbnail ?? wi.product.images?.[0]?.url ?? null, 300),
    rating: wi.product.rating,
    stock: wi.product.stock
  }));

  res.status(HTTP_STATUS.OK).json({ success: true, data: { items } });
});

export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = Number(req.body.product_id);

  if (!productId) {
    throw new AppError('product_id is required', HTTP_STATUS.BAD_REQUEST);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
  }

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {}
  });

  res.status(HTTP_STATUS.OK).json({ success: true });
});

export const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const productId = Number(req.params.productId);

  await prisma.wishlistItem.deleteMany({
    where: { userId, productId }
  });

  res.status(HTTP_STATUS.OK).json({ success: true });
});
