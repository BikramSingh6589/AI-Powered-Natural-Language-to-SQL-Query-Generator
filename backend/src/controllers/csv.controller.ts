import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { parseCSVAndExtractSchema } from '../services/csv/csv.service';
import { createDynamicTable, insertDataIntoTable } from '../services/database/table.service';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const uploadCsv = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    // When using CloudinaryStorage, req.file.path contains the secure Cloudinary URL
    const filePath = (req.file as any).path || (req.file as any).secure_url;
    const { originalname } = req.file;
    const name = req.body.name || originalname.split('.')[0];
    
    if (!filePath) {
      throw new AppError('File upload to Cloudinary failed', 500);
    }

    // Parse CSV from the Cloudinary URL
    const { headers, types, records } = await parseCSVAndExtractSchema(filePath);

    if (headers.length === 0 || records.length === 0) {
      throw new AppError('CSV file is empty or invalid', 400);
    }

    // Dynamic table name ensuring uniqueness but keeping the clean name
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const shortId = Date.now().toString().slice(-6); // Keep it short
    const tableName = `${sanitizedName}_${shortId}`;

    // Create table in DB
    await createDynamicTable(tableName, types);

    // Insert records
    await insertDataIntoTable(tableName, headers, records);

    // Save Dataset metadata (filePath is now the Cloudinary URL)
    const dataset = await prisma.dataset.create({
      data: {
        userId: req.user.id,
        name,
        filePath,   // Cloudinary secure URL
        tableName,
        schemaInfo: types,
      },
    });

    res.status(201).json(ApiResponse.success('CSV uploaded and processed successfully', {
      dataset: {
        id: dataset.id,
        name: dataset.name,
        columns: Object.keys(types),
        rowCount: records.length,
      }
    }));
  } catch (error) {
    next(error);
  }
};

export const getDatasets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const datasets = await prisma.dataset.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(ApiResponse.success('Datasets retrieved', { datasets }));
  } catch (error) {
    next(error);
  }
};
