import React, { createContext, useContext, useState } from 'react';

export interface QueryResult {
  columns: string[];
  rows: any[];
  executionTimeMs: number;
  historyId?: string;
}

interface QueryContextType {
  naturalQuery: string;
  setNaturalQuery: (q: string) => void;
  generatedSql: string;
  setGeneratedSql: (sql: string) => void;
  explanation: string;
  setExplanation: (exp: string) => void;
  queryResult: QueryResult | null;
  setQueryResult: (res: QueryResult | null) => void;
  clearQuery: () => void;
  historyId: string | null;
  setHistoryId: (id: string | null) => void;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [naturalQuery, setNaturalQuery] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [explanation, setExplanation] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const clearQuery = () => {
    setNaturalQuery('');
    setGeneratedSql('');
    setExplanation('');
    setQueryResult(null);
    setHistoryId(null);
  };

  return (
    <QueryContext.Provider value={{
      naturalQuery, setNaturalQuery,
      generatedSql, setGeneratedSql,
      explanation, setExplanation,
      queryResult, setQueryResult,
      clearQuery,
      historyId, setHistoryId
    }}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQuery = () => {
  const context = useContext(QueryContext);
  if (context === undefined) {
    throw new Error('useQuery must be used within a QueryProvider');
  }
  return context;
};
