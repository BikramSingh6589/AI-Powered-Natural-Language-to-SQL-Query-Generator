import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import { executeSqlQuery } from '../services/query/execution.service';

export const executeQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { historyId } = req.body;

    if (!historyId) {
      throw new AppError('historyId is required', 400);
    }

    const historyRecord = await prisma.queryHistory.findUnique({
      where: { id: historyId }
    });

    if (!historyRecord || historyRecord.userId !== req.user!.id) {
      throw new AppError('Query history not found', 404);
    }

    // Execute the SQL
    const executionResult = await executeSqlQuery(historyRecord.generatedSQL);

    // Update history with execution time
    await prisma.queryHistory.update({
      where: { id: historyId },
      data: { executionTimeMs: executionResult.executionTimeMs }
    });

    res.status(200).json(ApiResponse.success('Query executed successfully', executionResult));

  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const limit = parseInt((limitRaw as string) || '50', 10);
    const history = await prisma.queryHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        dataset: {
          select: { name: true }
        }
      }
    });

    const total = await prisma.queryHistory.count({ where: { userId: req.user!.id } });

    res.status(200).json(ApiResponse.success('Query history retrieved', { history, total }));
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params['id'] as string;
    const record = await prisma.queryHistory.findUnique({ where: { id } });

    if (!record || record.userId !== req.user!.id) {
      throw new AppError('History record not found', 404);
    }

    await prisma.queryHistory.delete({ where: { id } });
    res.status(200).json(ApiResponse.success('History item deleted', null));
  } catch (error) {
    next(error);
  }
};
