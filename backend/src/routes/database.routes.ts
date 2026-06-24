import express from 'express';
import { getDatabaseTables } from '../controllers/database.controller';

const router = express.Router();

// Get all tables in the connected database
router.get('/tables', getDatabaseTables);

export default router;
