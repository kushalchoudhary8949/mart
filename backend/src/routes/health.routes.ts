import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';
import { catchAsync } from '../middlewares/asyncWrapper';

const router = Router();

router.get('/', catchAsync(healthCheck));

export default router;
