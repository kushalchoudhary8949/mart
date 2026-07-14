import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as controller from '../controllers/wishlist.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.getWishlist);
router.post('/', controller.addToWishlist);
router.delete('/:productId', controller.removeFromWishlist);

export default router;
