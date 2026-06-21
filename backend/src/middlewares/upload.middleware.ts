import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import path from 'path';
import { AppError } from '../utils/AppError';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: Express.Multer.File) => {
    let baseName = req.body.name ? req.body.name : path.parse(file.originalname).name;
    baseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const shortSuffix = Math.floor(1000 + Math.random() * 9000);
    
    return {
      folder: 'sql_analyzer_csvs',
      resource_type: 'raw',
      format: 'csv',
      public_id: `${baseName}_${shortSuffix}`,
    };
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only CSV files are allowed.', 400));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB limit by default
  },
  fileFilter,
});

