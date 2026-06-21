import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Copy, Check, FileCode2, History, MessageSquare, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { useQuery } from '../context/QueryContext';
import { useDataset, Dataset } from '../context/DatasetContext';
import { api } from '../services/api';

export const QueryGenerator: React.FC = () => {
  const { naturalQuery, setNaturalQuery, generatedSql, setGeneratedSql, explanation, setExplanation, setQueryResult, historyId, setHistoryId } = useQuery();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { dataset, setSelectedDataset, datasets, addDataset } = useDataset();
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [isEditingSql, setIsEditingSql] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDbConnected(localStorage.getItem('dbConnected') === 'true');
  }, []);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get('/csv/datasets');
        const fetchedDatasets = response.data.data.datasets;
        setAvailableDatasets(fetchedDatasets);
        
        // If we have datasets but none selected, select the first one
        if (fetchedDatasets.length > 0 && !dataset) {
          setSelectedDataset(fetchedDatasets[0]);
        }
      } catch (error) {
        console.error('Failed to load datasets', error);
      }
    };
    fetchDatasets();
  }, []);

  const handleGenerate = async () => {
    if (!naturalQuery.trim()) {
      toast.error('Please enter a question first');
      return;
    }

    if (!dataset?.id) {
      toast.error('Please select a dataset first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post('/query/generate', {
        datasetId: dataset.id,
        naturalQuery
      });
      
      const { sql, explanation, historyId: newHistoryId } = response.data.data;
      
      setGeneratedSql(sql);
      setExplanation(explanation);
      setHistoryId(newHistoryId);
      toast.success('SQL Query generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate query');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecute = async () => {
    if (!generatedSql || !historyId) return;

    setIsExecuting(true);
    try {
      const response = await api.post('/query/execute', { historyId });
      
      setQueryResult({
        columns: response.data.data.fields,
        rows: response.data.data.rows,
        executionTimeMs: response.data.data.executionTimeMs
      });
      
      toast.success('Query executed successfully');
      navigate('/results');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopied(true);
    toast.success('Query copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            Query Generator
            {dbConnected ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/20 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                DB Connected
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/20 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                DB Disconnected
              </span>
            )}
          </h2>
          <p className="text-text-secondary mt-1">Translate your natural language questions into executable SQL queries.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
          <Database className="w-4 h-4 text-secondary" />
          <select 
            value={dataset?.id || ''} 
            onChange={(e) => {
              const selected = availableDatasets.find(d => d.id === e.target.value);
              if (selected) setSelectedDataset(selected);
            }}
            className="bg-transparent border-none text-sm font-medium text-text-primary focus:outline-none focus:ring-0 cursor-pointer min-w-[150px]"
          >
            <option value="" disabled>Select Dataset</option>
            {availableDatasets.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Section */}
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Textarea
              placeholder="Ask anything about your data... (e.g., 'Show me the top 5 customers by revenue this year')"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              className="min-h-[140px] text-base resize-none pb-16"
              disabled={isGenerating || isExecuting}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <Button 
                onClick={handleGenerate} 
                isLoading={isGenerating}
                disabled={!naturalQuery.trim() || isExecuting}
                className="gap-2 rounded-full"
              >
                {!isGenerating && <Sparkles className="w-4 h-4" />}
                Generate SQL
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated SQL & Explanation Section */}
      <div className={`grid md:grid-cols-5 gap-6 transition-all duration-500 ${generatedSql ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <Card className="md:col-span-3 flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-background border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-primary" />
              Generated SQL
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1 text-text-secondary hover:text-text-primary">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-card/50 relative group">
            {isEditingSql ? (
              <textarea
                value={generatedSql}
                onChange={(e) => setGeneratedSql(e.target.value)}
                className="w-full h-full min-h-[200px] p-6 text-sm font-mono text-text-primary bg-background/50 border-none focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none rounded-b-xl"
                spellCheck="false"
              />
            ) : (
              <pre className="p-6 text-sm font-mono text-text-primary/90 overflow-x-auto h-full min-h-[200px]">
                {generatedSql}
              </pre>
            )}
            
            <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isEditingSql ? (
                <Button 
                  variant="secondary" 
                  onClick={() => setIsEditingSql(false)}
                  className="bg-card text-text-primary hover:bg-card/90 shadow-sm border border-border/50"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-1.5 text-success" />
                  Save Changes
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  onClick={() => setIsEditingSql(true)}
                  className="bg-card text-text-primary hover:bg-card/90 shadow-sm border border-border/50"
                  size="sm"
                >
                  Edit SQL
                </Button>
              )}
              <Button 
                onClick={handleExecute}
                isLoading={isExecuting}
                className="gap-2 shadow-sm"
                size="sm"
              >
                {!isExecuting && <Play className="w-3.5 h-3.5 fill-current" />}
                Execute
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="py-4 border-b border-border bg-background">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-secondary" />
              AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm leading-relaxed text-text-secondary">
              {explanation}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
