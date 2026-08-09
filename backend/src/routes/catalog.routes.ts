import { Router } from 'express';
import { validateQuery } from '../middlewares/validate';
import { productQuerySchema } from '../validators/catalog.validator';
import {
  getCategories,
  getCategoryDetail,
  getBanners,
  getProducts,
  getSearchSuggestions,
  getProductDetail,
  getProductImages,
} from '../controllers/catalog.controller';

const router = Router();

// Public Customer Catalog Routes
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryDetail);
router.get('/banners', getBanners);
router.get('/products', validateQuery(productQuerySchema), getProducts);
router.get('/products/search/suggestions', getSearchSuggestions);
// This specific route must be registered before the generic slug route.
// Otherwise `/products/123/images` is interpreted as a product slug request.
router.get('/products/:id/images', getProductImages);
router.get('/products/:slug', getProductDetail);

export default router;
