import { Router } from 'express';
import { validateQuery } from '../middlewares/validate';
import { productQuerySchema } from '../validators/catalog.validator';
import {
  getCategories,
  getCategoryDetail,
  getBanners,
  getProducts,
  getProductDetail,
  getProductImages,
} from '../controllers/catalog.controller';

const router = Router();

// Public Customer Catalog Routes
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryDetail);
router.get('/banners', getBanners);
router.get('/products', validateQuery(productQuerySchema), getProducts);
router.get('/products/:slug', getProductDetail);
router.get('/products/:id/images', getProductImages);

export default router;
