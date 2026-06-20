import { Router } from 'express';
import { exportCsv, exportExcel, exportPdf } from '../controllers/export.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/csv/:historyId', exportCsv);
router.get('/excel/:historyId', exportExcel);
router.get('/pdf/:historyId', exportPdf);

export default router;
