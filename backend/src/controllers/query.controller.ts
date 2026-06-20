import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';
import { callGroq } from '../services/ai/groq.service';
import { buildSqlPrompt, buildExplanationPrompt } from '../services/ai/prompt-builder.service';
import { validateSql } from '../services/ai/sql-validator.service';

export const generateQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { datasetId, naturalQuery } = req.body;

    if (!datasetId || !naturalQuery) {
      throw new AppError('datasetId and naturalQuery are required', 400);
    }

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId }
    });

    if (!dataset) {
      throw new AppError('Dataset not found', 404);
    }

    // 1. Build prompt
    const { systemPrompt, userPrompt } = buildSqlPrompt(naturalQuery, dataset.tableName, dataset.schemaInfo as Record<string, string>);

    // 2. Call Groq to generate SQL
    let generatedSQL = await callGroq(systemPrompt, userPrompt);
    generatedSQL = generatedSQL.trim();
    // Sometimes LLMs wrap in markdown even when instructed not to
    generatedSQL = generatedSQL.replace(/```sql/g, '').replace(/```/g, '').trim();

    // 3. Validate SQL
    validateSql(generatedSQL);

    // 4. Call Groq for Explanation
    const explanationPrompts = buildExplanationPrompt(generatedSQL, naturalQuery, dataset.name);
    const explanation = await callGroq(explanationPrompts.systemPrompt, explanationPrompts.userPrompt);

    // 5. Store in Query History
    const queryHistory = await prisma.queryHistory.create({
      data: {
        userId: req.user!.id,
        datasetId: dataset.id,
        naturalQuery,
        generatedSQL,
        explanation,
        status: 'SUCCESS', // Set SUCCESS for generation, EXECUTION will be separate
      }
    });

    res.status(200).json(ApiResponse.success('Query generated successfully', {
      historyId: queryHistory.id,
      sql: generatedSQL,
      explanation
    }));

  } catch (error) {
    next(error);
  }
};
