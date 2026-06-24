import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export const getDatabaseTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch all tables from public schema, exclude Prisma migrations tables
    const tablesResult = await prisma.$queryRaw`
      SELECT 
        tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename NOT LIKE '_prisma_%'
      ORDER BY tablename
    `;

    const tableNames = (tablesResult as any[]).map(t => t.tablename);

    // For each table, get its column information
    const tablesWithSchema: any[] = [];

    for (const tableName of tableNames) {
      const columnsResult = await prisma.$queryRaw`
        SELECT 
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      const schemaInfo = (columnsResult as any[]).reduce((acc, col) => {
        acc[col.column_name] = col.data_type;
        return acc;
      }, {} as Record<string, string>);

      tablesWithSchema.push({
        name: tableName,
        schemaInfo
      });
    }

    res.status(200).json(ApiResponse.success('Tables fetched successfully', {
      tables: tablesWithSchema
    }));
  } catch (error: any) {
    next(new AppError(`Failed to fetch tables: ${error.message}`, 500));
  }
};
