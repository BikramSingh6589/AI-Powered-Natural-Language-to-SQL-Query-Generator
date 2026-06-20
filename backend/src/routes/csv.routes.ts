import { Router } from 'express';
import { uploadCsv, getDatasets } from '../controllers/csv.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// All CSV routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), uploadCsv);
router.get('/datasets', getDatasets);

export default router;
