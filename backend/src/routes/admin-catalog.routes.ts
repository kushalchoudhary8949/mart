import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { Role } from '@prisma/client';
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createBannerSchema,
  updateBannerSchema,
  stockAdjustmentSchema,
  offerSchema,
} from '../validators/catalog.validator';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  adjustStock,
  getCustomers,
  getKpis,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  sendNotification,
  broadcastOffer,
} from '../controllers/admin-catalog.controller';

const router = Router();

// Protect all admin catalog routes with Auth + Admin Role
router.use(authenticate, authorize([Role.ADMIN]));

// --- Categories CRUD ---
router.get('/categories', getCategories);
router.post('/categories', validate(createCategorySchema), createCategory);
router.put('/categories/:id', validate(updateCategorySchema), updateCategory);
router.delete('/categories/:id', deleteCategory);

// --- Products CRUD ---
router.get('/products', getProducts);
router.post('/products', validate(createProductSchema), createProduct);
router.put('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/adjust-stock', validate(stockAdjustmentSchema), adjustStock);

router.get('/customers', getCustomers);
router.post('/notifications', sendNotification);
router.get('/kpis', getKpis);
router.get('/offers', getOffers);
router.post('/offers', validate(offerSchema), createOffer);
router.put('/offers/:id', validate(offerSchema.partial()), updateOffer);
router.delete('/offers/:id', deleteOffer);
router.post('/offers/:id/broadcast', broadcastOffer);

// --- Banners CRUD ---
router.get('/banners', getBanners);
router.post('/banners', validate(createBannerSchema), createBanner);
router.put('/banners/:id', validate(updateBannerSchema), updateBanner);
router.delete('/banners/:id', deleteBanner);

export default router;
