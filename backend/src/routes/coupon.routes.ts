import { Router } from 'express';
import { getCoupons, validateCoupon } from '../controllers/coupon.controller';

const router = Router();
router.get('/', getCoupons);
router.post('/validate', validateCoupon);
export default router;
