import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import catalogRoutes from './catalog.routes';
import adminCatalogRoutes from './admin-catalog.routes';
import deliveryRoutes from './delivery.routes';
import adminDeliveryRoutes from './admin-delivery.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import addressRoutes from './address.routes';
import couponRoutes from './coupon.routes';
import orderRoutes from './order.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Mount API routes
router.use('/health', healthRoutes);
router.get('/store/info', (_req, res) => res.json({
  success: true,
  data: { name: 'Vrindavan Mart', logo: '🛒', address: '123 Mart Street, Grocery City', timings: '6:00 AM - 11:00 PM', delivery_fee: 25, free_delivery_threshold: 499 },
}));
router.use('/auth', authRoutes);
router.use('/', catalogRoutes); // public routes: /categories, /products, /banners
router.use('/admin', adminCatalogRoutes); // admin CRUD routes: /admin/categories, /admin/products, etc.
router.use('/admin', adminDeliveryRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/addresses', addressRoutes);
router.use('/coupons', couponRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);

export default router;
