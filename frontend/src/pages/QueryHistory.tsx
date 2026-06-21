import React, { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Copy, Trash2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';

type HistoryItem = {
  id: string;
  createdAt: string;
  naturalQuery: string;
  generatedSQL: string;
  status: 'SUCCESS' | 'ERROR';
  executionTimeMs: number | null;
};

export const QueryHistory: React.FC = () => {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/query/history');
        setData(response.data.data.history || []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load query history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
    toast.success('SQL copied to clipboard');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/query/history/${id}`);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('History entry deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete history entry');
    }
  };

  const columns = useMemo<ColumnDef<HistoryItem, any>[]>(() => [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: info => {
        const date = new Date(info.getValue());
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{date.toLocaleDateString()}</span>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Clock className="w-3 h-3" /> {date.toLocaleTimeString()}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'naturalQuery',
      header: 'Question',
      cell: info => (
        <div className="max-w-[250px] truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      )
    },
    {
      accessorKey: 'generatedSQL',
      header: 'Generated SQL',
      cell: info => (
        <div className="max-w-[300px] truncate font-mono text-xs text-text-secondary bg-background px-2 py-1 rounded" title={info.getValue()}>
          {info.getValue()}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => (
        <Badge variant={info.getValue() === 'SUCCESS' ? 'success' : 'destructive'}>
          {info.getValue() === 'SUCCESS' ? 'Success' : 'Failed'}
        </Badge>
      )
    },
    {
      accessorKey: 'executionTimeMs',
      header: 'Time',
      cell: info => (
        <span className="text-sm text-text-secondary">
          {info.getValue() != null ? `${info.getValue()}ms` : '—'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => handleCopy(row.original.generatedSQL)}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-error hover:bg-error/10 transition-colors" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Query History</h2>
        <p className="text-text-secondary mt-1">View, reuse, or manage your previously generated queries.</p>
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={data} 
              searchKey="naturalQuery"
              searchPlaceholder="Search questions..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
