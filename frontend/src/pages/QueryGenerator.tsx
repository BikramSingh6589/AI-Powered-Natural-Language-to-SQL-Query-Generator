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
  const navigate = useNavigate();

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Query Generator</h2>
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
          <CardContent className="p-0 flex-1 bg-[#0F172A] relative">
            <pre className="p-6 text-sm font-mono text-[#F8FAFC] overflow-x-auto h-full">
              {generatedSql}
            </pre>
            
            <div className="absolute bottom-4 right-4 flex gap-3">
              <Button 
                variant="secondary" 
                className="bg-card text-text-primary hover:bg-card/90"
              >
                Edit SQL
              </Button>
              <Button 
                onClick={handleExecute}
                isLoading={isExecuting}
                className="gap-2 bg-success hover:bg-success/90 text-white"
              >
                {!isExecuting && <Play className="w-4 h-4 fill-current" />}
                Execute Query
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
