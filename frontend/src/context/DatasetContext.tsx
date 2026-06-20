import React, { createContext, useContext, useState } from 'react';

export interface ColumnInfo {
  name: string;
  type: string;
}

export interface Dataset {
  id: string;
  name: string;
  rowCount?: number;
  columns?: ColumnInfo[];
  previewData?: any[];
}

interface DatasetContextType {
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;
  clearDataset: () => void;
  datasets: Dataset[];
  addDataset: (dataset: Dataset) => void;
  setSelectedDataset: (dataset: Dataset) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const clearDataset = () => setDataset(null);

  const addDataset = (newDataset: Dataset) => {
    setDatasets(prev => {
      const exists = prev.find(d => d.id === newDataset.id);
      if (exists) return prev;
      return [...prev, newDataset];
    });
  };

  const setSelectedDataset = (selected: Dataset) => {
    setDataset(selected);
    addDataset(selected);
  };

  return (
    <DatasetContext.Provider value={{ dataset, setDataset, clearDataset, datasets, addDataset, setSelectedDataset }}>
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
