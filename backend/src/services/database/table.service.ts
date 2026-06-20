import { Client } from 'pg';
import prisma from '../../config/db';
import { AppError } from '../../utils/AppError';

export const createDynamicTable = async (tableName: string, types: Record<string, string>) => {
  const columns = Object.entries(types)
    .map(([col, type]) => `"${col}" ${type}`)
    .join(', ');

  const query = `CREATE TABLE IF NOT EXISTS "${tableName}" (id SERIAL PRIMARY KEY, ${columns})`;

  try {
    await prisma.$executeRawUnsafe(query);
  } catch (error: any) {
    throw new AppError(`Failed to create dynamic table: ${error.message}`, 500);
  }
};

export const insertDataIntoTable = async (tableName: string, headers: string[], records: any[]) => {
  if (records.length === 0) return;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    // Batch inserts for performance
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const valueStrings: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      batch.forEach((record) => {
        const rowValues = headers.map((header) => record[header] ?? null);
        values.push(...rowValues);
        
        const placeholders = headers.map(() => `$${paramIndex++}`);
        valueStrings.push(`(${placeholders.join(', ')})`);
      });

      const headerString = headers.map(h => `"${h}"`).join(', ');
      const query = `INSERT INTO "${tableName}" (${headerString}) VALUES ${valueStrings.join(', ')}`;
      
      await client.query(query, values);
    }
  } catch (error: any) {
    throw new AppError(`Failed to insert data: ${error.message}`, 500);
  } finally {
    await client.end();
  }
};
