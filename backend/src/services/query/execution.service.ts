import { Client } from 'pg';
import { AppError } from '../../utils/AppError';

export const executeSqlQuery = async (sql: string) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    const startTime = Date.now();
    const result = await client.query(sql);
    const executionTimeMs = Date.now() - startTime;
    
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map(f => f.name),
      executionTimeMs
    };
  } catch (error: any) {
    throw new AppError(`Query Execution Failed: ${error.message}`, 400);
  } finally {
    await client.end();
  }
};
