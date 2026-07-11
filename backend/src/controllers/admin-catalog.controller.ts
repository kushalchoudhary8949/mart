import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/asyncWrapper';
import { HTTP_STATUS } from '../utils/constants';
import * as adminService from '../services/admin-catalog.service';

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
  const id = parseInt(req.params.id, 10);
  const result = await adminService.updateCategory(id, req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
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
  const id = parseInt(req.params.id, 10);
  const result = await adminService.updateProduct(id, req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const result = await adminService.deactivateProduct(id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

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
  const id = parseInt(req.params.id, 10);
  const result = await adminService.updateBanner(id, req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const result = await adminService.deleteBanner(id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});
