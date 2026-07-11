import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import * as catalogService from '../services/catalog.service';
import { AppError } from '../utils/AppError';

// ─── GET /categories ─────────────────────────────────────────────────────────

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await catalogService.getCategories();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── GET /categories/:slug ───────────────────────────────────────────────────

export const getCategoryDetail = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await catalogService.getCategoryDetail(slug);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── GET /banners ────────────────────────────────────────────────────────────

export const getBanners = catchAsync(async (_req: Request, res: Response) => {
  const result = await catalogService.getActiveBanners();
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── GET /products ───────────────────────────────────────────────────────────

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  // Query params are already parsed & validated via Zod middleware
  const result = await catalogService.queryProducts(req.query as any);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── GET /products/:slug ─────────────────────────────────────────────────────

export const getProductDetail = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await catalogService.getProductDetail(slug);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// ─── GET /products/:id/images ────────────────────────────────────────────────

export const getProductImages = catchAsync(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id, 10);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    throw new AppError('Product ID must be a positive integer.', HTTP_STATUS.BAD_REQUEST);
  }
  const result = await catalogService.getProductImageGallery(productId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});
