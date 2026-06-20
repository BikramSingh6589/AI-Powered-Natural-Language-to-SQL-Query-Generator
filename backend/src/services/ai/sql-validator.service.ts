import { AppError } from '../../utils/AppError';

const DANGEROUS_KEYWORDS = [
  'DROP', 'TRUNCATE', 'ALTER', 'DELETE', 'UPDATE', 'INSERT',
  'GRANT', 'REVOKE', 'REPLACE', 'EXEC', 'EXECUTE', 'MERGE',
  'CALL', 'COMMIT', 'ROLLBACK', 'SAVEPOINT'
];

export const validateSql = (sql: string) => {
  const upperSql = sql.toUpperCase();
  
  // Basic check for dangerous keywords
  // A simple regex to find the word alone, not as part of another word
  for (const keyword of DANGEROUS_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(upperSql)) {
      throw new AppError(`Unsafe SQL operation detected: Use of restricted keyword '${keyword}'`, 403);
    }
  }

  // Ensure it starts with SELECT or WITH
  const trimmed = upperSql.trim();
  if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH')) {
    throw new AppError('Only SELECT queries are allowed.', 403);
  }

  return sql;
};
