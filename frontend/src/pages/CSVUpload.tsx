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
    formData.append('name', file.name.replace('.csv', ''));
    formData.append('file', file);

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

      <Card className="border-border/60 shadow-xl overflow-hidden bg-gradient-to-b from-card to-background">
        <CardContent className="p-8 pt-8">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center py-14 transition-all duration-300 relative group ${isDragging
                ? 'border-primary bg-primary/10 shadow-[inset_0_0_50px_rgba(var(--primary-rgb),0.1)]'
                : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 cursor-pointer'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
              <div className="w-20 h-20 rounded-3xl bg-card shadow-sm flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300 border border-border/50 relative z-10">
                <UploadCloud className="w-10 h-10 group-hover:animate-bounce-slow" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3 relative z-10">Upload your CSV</h3>
              <p className="text-sm font-medium text-text-secondary mb-8 relative z-10">Drag and drop or click to browse (max 10MB)</p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".csv"
                className="hidden"
              />
              <Button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="rounded-xl px-10 py-6 text-base shadow-lg shadow-primary/20 relative z-10 hover:-translate-y-0.5 transition-transform"
              >
                Select File
              </Button>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <FileSpreadsheet className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-text-primary mb-1">{file.name}</h4>
                    <p className="text-xs font-medium text-text-secondary tracking-wide">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setFile(null)} disabled={isUploading} className="rounded-xl px-6 border-border/50">
                  Cancel
                </Button>
                <Button onClick={handleUpload} isLoading={isUploading} className="rounded-xl px-6 shadow-md shadow-primary/20">
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
