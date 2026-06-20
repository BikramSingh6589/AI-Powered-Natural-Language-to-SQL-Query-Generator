import { Router } from 'express';
import { generateQuery } from '../controllers/query.controller';
import { executeQuery, getHistory, deleteHistoryItem } from '../controllers/execution.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/generate', generateQuery);
router.post('/execute', executeQuery);
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistoryItem);

export default router;
