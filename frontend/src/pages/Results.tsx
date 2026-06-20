import React, { useMemo } from 'react';
import { Download, FileDown, FileText } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { useQuery } from '../context/QueryContext';
import { DataTable } from '../components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Results: React.FC = () => {
  const { queryResult, naturalQuery, generatedSql, historyId } = useQuery();

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    if (!queryResult) return [];
    
    return queryResult.columns.map(col => ({
      accessorKey: col,
      header: col.replace(/_/g, ' ').toUpperCase(),
      cell: info => {
        const value = info.getValue();
        if (typeof value === 'number') {
          return new Intl.NumberFormat('en-US').format(value);
        }
        return value ?? '—';
      }
    }));
  }, [queryResult]);

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    if (!historyId) {
      toast.error('No query to export');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api/v1'}/export/${type}/${historyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = type === 'excel' ? 'xlsx' : type;
      a.download = `query_results.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${type.toUpperCase()}`);
    } catch (error: any) {
      toast.error('Failed to export results');
    }
  };

  if (!queryResult) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">No Results Found</h2>
        <p className="text-text-secondary">Execute a query from the Query Generator to see results here.</p>
        <Button onClick={() => window.location.href = '/query'}>Go to Query Generator</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Query Results</h2>
          <p className="text-text-secondary mt-1">{naturalQuery}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('csv')} className="gap-2">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('excel')} className="gap-2">
            <FileDown className="w-4 h-4" /> Excel
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} className="gap-2">
            <FileText className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-text-secondary mb-1">Total Records</div>
            <div className="text-3xl font-bold text-text-primary">
              {new Intl.NumberFormat('en-US').format(queryResult.rows.length)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-text-secondary mb-1">Execution Time</div>
            <div className="text-3xl font-bold text-text-primary">
              {queryResult.executionTimeMs} <span className="text-base font-normal text-text-secondary">ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-text-secondary mb-1">Columns</div>
            <div className="text-3xl font-bold text-text-primary">
              {queryResult.columns.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={queryResult.rows} 
            searchKey={queryResult.columns[0]} 
            searchPlaceholder="Search results..."
          />
        </CardContent>
      </Card>

      <details className="group border border-border rounded-xl bg-card overflow-hidden">
        <summary className="p-4 font-medium text-text-primary cursor-pointer hover:bg-background transition-colors list-none flex items-center justify-between">
          View Executed SQL
          <span className="transition group-open:rotate-180">
            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
          </span>
        </summary>
        <div className="p-4 pt-0 bg-background border-t border-border">
          <pre className="text-sm font-mono text-text-secondary mt-4 overflow-x-auto whitespace-pre-wrap">
            {generatedSql}
          </pre>
        </div>
      </details>
    </div>
  );
};
