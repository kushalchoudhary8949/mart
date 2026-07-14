import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as controller from '../controllers/cart.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.getCart);
router.post('/', controller.addToCart);
router.put('/:productId', controller.updateCartItem);
router.delete('/:productId', controller.removeCartItem);
router.delete('/', controller.clearCart);

export default router;
