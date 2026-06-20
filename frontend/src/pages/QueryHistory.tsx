import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Copy, Trash2, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '../components/ui/DataTable';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

type HistoryItem = {
  id: string;
  date: string;
  naturalQuery: string;
  sqlQuery: string;
  status: 'Success' | 'Failed';
  executionTime: string;
};

export const QueryHistory: React.FC = () => {
  // Mock Data
  const data: HistoryItem[] = [
    {
      id: '1',
      date: '2026-06-20 09:30 AM',
      naturalQuery: 'Show me the top 5 customers by revenue this year',
      sqlQuery: 'SELECT customer_name, SUM(revenue) FROM sales_2026 GROUP BY customer_name ORDER BY SUM(revenue) DESC LIMIT 5;',
      status: 'Success',
      executionTime: '42ms'
    },
    {
      id: '2',
      date: '2026-06-19 02:15 PM',
      naturalQuery: 'Total sales grouped by region',
      sqlQuery: 'SELECT region, COUNT(*) FROM sales GROUP BY region;',
      status: 'Success',
      executionTime: '12ms'
    },
    {
      id: '3',
      date: '2026-06-18 11:05 AM',
      naturalQuery: 'Get all active employees',
      sqlQuery: 'SELECT * FROM employees WHERE status = active;',
      status: 'Failed',
      executionTime: '0ms'
    }
  ];

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
    toast.success('SQL copied to clipboard');
  };

  const columns = useMemo<ColumnDef<HistoryItem, any>[]>(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: info => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{info.getValue().split(' ')[0]}</span>
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <Clock className="w-3 h-3" /> {info.getValue().split(' ')[1]} {info.getValue().split(' ')[2]}
          </span>
        </div>
      )
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
      accessorKey: 'sqlQuery',
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
        <Badge variant={info.getValue() === 'Success' ? 'success' : 'destructive'}>
          {info.getValue()}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-primary">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-primary" onClick={() => handleCopy(row.original.sqlQuery)}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-error">
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

      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={data} 
            searchKey="naturalQuery"
            searchPlaceholder="Search questions..."
          />
        </CardContent>
      </Card>
    </div>
  );
};
