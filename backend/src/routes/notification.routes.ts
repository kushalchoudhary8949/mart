import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getNotifications, markAllRead, markRead } from '../controllers/notification.controller';
const router = Router();
router.use(authenticate);
router.get('/', getNotifications);
router.post('/read-all', markAllRead);
router.post('/:id/read', markRead);
export default router;
