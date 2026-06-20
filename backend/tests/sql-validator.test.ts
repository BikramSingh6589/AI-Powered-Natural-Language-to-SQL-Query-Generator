import { validateSql } from '../src/services/ai/sql-validator.service';
import { AppError } from '../src/utils/AppError';

describe('SQL Validator Service', () => {
  it('should pass valid SELECT queries', () => {
    expect(validateSql('SELECT * FROM users')).toBe('SELECT * FROM users');
    expect(validateSql('  select id, name from public.dataset_123  ')).toBe('  select id, name from public.dataset_123  ');
  });

  it('should throw error for DROP queries', () => {
    expect(() => validateSql('DROP TABLE users')).toThrow(AppError);
  });

  it('should throw error for UPDATE queries', () => {
    expect(() => validateSql('UPDATE users SET name = "Test"')).toThrow(AppError);
  });

  it('should throw error for queries not starting with SELECT or WITH', () => {
    expect(() => validateSql('INSERT INTO users (name) VALUES ("Test")')).toThrow(AppError);
  });
});
