import React, { useState } from 'react';
import { Play, Sparkles, Copy, Check, FileCode2, History, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { useQuery } from '../context/QueryContext';

export const QueryGenerator: React.FC = () => {
  const { naturalQuery, setNaturalQuery, generatedSql, setGeneratedSql, explanation, setExplanation, setQueryResult } = useQuery();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!naturalQuery.trim()) {
      toast.error('Please enter a question first');
      return;
    }

    setIsGenerating(true);
    try {
      // Mock API Call to LLM
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSql = `SELECT\n  customer_name,\n  SUM(revenue) AS total_revenue\nFROM\n  sales_2026\nWHERE\n  created_at >= '2026-01-01'\nGROUP BY\n  customer_name\nORDER BY\n  total_revenue DESC\nLIMIT 5;`;
      const mockExplanation = "This query calculates the total revenue per customer by summing up the 'revenue' column from the 'sales_2026' table for all records created on or after January 1st, 2026. It then groups the results by customer name and orders them in descending order to show the top 5 customers with the highest revenue.";
      
      setGeneratedSql(mockSql);
      setExplanation(mockExplanation);
      toast.success('SQL Query generated successfully');
    } catch (error) {
      toast.error('Failed to generate query');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecute = async () => {
    if (!generatedSql) return;

    setIsExecuting(true);
    try {
      // Mock API call to execute query
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setQueryResult({
        columns: ['customer_name', 'total_revenue'],
        rows: [
          { customer_name: 'Acme Corp', total_revenue: 125000 },
          { customer_name: 'Globex', total_revenue: 98000 },
          { customer_name: 'Initech', total_revenue: 85000 },
          { customer_name: 'Umbrella Corp', total_revenue: 72000 },
          { customer_name: 'Soylent', total_revenue: 65000 },
        ],
        executionTimeMs: 42
      });
      
      toast.success('Query executed successfully');
      navigate('/results');
    } catch (error) {
      toast.error('Query execution failed');
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Query Generator</h2>
        <p className="text-text-secondary mt-1">Translate your natural language questions into executable SQL queries.</p>
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
