import React, { createContext, useContext, useState } from 'react';

export interface ColumnInfo {
  name: string;
  type: string;
}

export interface Dataset {
  id: string;
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
  previewData: any[];
}

interface DatasetContextType {
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;
  clearDataset: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  const clearDataset = () => setDataset(null);

  return (
    <DatasetContext.Provider value={{ dataset, setDataset, clearDataset }}>
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};
