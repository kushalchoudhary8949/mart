import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import catalogRoutes from './catalog.routes';
import adminCatalogRoutes from './admin-catalog.routes';

const router = Router();

// Mount API routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/', catalogRoutes); // public routes: /categories, /products, /banners
router.use('/admin', adminCatalogRoutes); // admin CRUD routes: /admin/categories, /admin/products, etc.

export default router;
