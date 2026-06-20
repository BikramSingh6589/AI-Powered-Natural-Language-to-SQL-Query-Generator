import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useDataset } from '../context/DatasetContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const CSVUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setDataset } = useDataset();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name.replace('.csv', ''));

    try {
      const response = await api.post('/csv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(percentCompleted);
        },
      });
      
      const newDataset = {
        id: response.data.data.dataset.id,
        name: response.data.data.dataset.name,
        rowCount: response.data.data.dataset.rowCount,
        columns: response.data.data.dataset.columns.map((col: string) => ({ name: col, type: 'string' })),
      };
      
      setDataset(newDataset);
      toast.success('Dataset uploaded successfully!');
      navigate('/query');
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload dataset');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Upload Dataset</h2>
        <p className="text-text-secondary mt-1">Upload a CSV file to automatically generate a database schema and start querying.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-[16px] flex flex-col items-center justify-center h-[280px] transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">Drag & drop your CSV file here</h3>
              <p className="text-sm text-text-secondary mb-6">or click to browse from your computer (max 10MB)</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInput} 
                accept=".csv" 
                className="hidden" 
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                Select File
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-[12px] border border-border bg-background">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{file.name}</h4>
                    <p className="text-sm text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {isUploading && (
                <div className="w-full bg-border rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              <Alert variant="info" title="Ready to analyze">
                Your file is ready to be processed. We will automatically detect columns and data types.
              </Alert>

              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setFile(null)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} isLoading={isUploading}>
                  Upload & Process
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
