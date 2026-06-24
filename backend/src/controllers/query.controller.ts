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
    const { datasetId, naturalQuery, tableName, schemaInfo } = req.body;

    if (!naturalQuery) {
      throw new AppError('naturalQuery is required', 400);
    }

    let targetTableName: string;
    let targetSchemaInfo: Record<string, string>;
    let datasetName: string = 'Database Tables';
    let targetDatasetId: string | null = null;

    if (datasetId) {
      // Case 1: Using a dataset from CSV upload
      const dataset = await prisma.dataset.findUnique({
        where: { id: datasetId }
      });

      if (!dataset) {
        throw new AppError('Dataset not found', 404);
      }

      targetTableName = dataset.tableName;
      targetSchemaInfo = dataset.schemaInfo as Record<string, string>;
      datasetName = dataset.name;
      targetDatasetId = dataset.id;
    } else if (tableName && schemaInfo) {
      // Case 2: Using a direct database table
      targetTableName = tableName;
      targetSchemaInfo = schemaInfo;
      datasetName = tableName;
    } else {
      throw new AppError('Either datasetId or tableName + schemaInfo are required', 400);
    }

    // 1. Build prompt
    const { systemPrompt, userPrompt } = buildSqlPrompt(naturalQuery, targetTableName, targetSchemaInfo);

    // 2. Call Groq to generate SQL
    let generatedSQL = await callGroq(systemPrompt, userPrompt);
    generatedSQL = generatedSQL.trim();
    // Sometimes LLMs wrap in markdown even when instructed not to
    generatedSQL = generatedSQL.replace(/```sql/g, '').replace(/```/g, '').trim();

    // 3. Validate SQL
    validateSql(generatedSQL);

    // 4. Call Groq for Explanation
    const explanationPrompts = buildExplanationPrompt(generatedSQL, naturalQuery, datasetName);
    const explanation = await callGroq(explanationPrompts.systemPrompt, explanationPrompts.userPrompt);

    // 5. Store in Query History
    const queryHistory = await prisma.queryHistory.create({
      data: {
        userId: req.user!.id,
        datasetId: targetDatasetId,
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
