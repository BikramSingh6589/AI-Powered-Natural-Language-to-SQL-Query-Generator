import React from 'react';
import { Database, FileSpreadsheet, Terminal, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Dashboard: React.FC = () => {
  const stats = [
    { title: 'Total Queries', value: '1,284', icon: Terminal, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Uploaded Datasets', value: '12', icon: FileSpreadsheet, color: 'text-secondary', bg: 'bg-secondary/10' },
    { title: 'Generated SQL', value: '856', icon: Database, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Execution Count', value: '3,492', icon: Activity, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  const recentActivity = [
    { id: 1, action: 'Generated SQL for "Top 10 customers"', time: '2 mins ago', status: 'Success' },
    { id: 2, action: 'Uploaded dataset "sales_2026.csv"', time: '1 hour ago', status: 'Success' },
    { id: 3, action: 'Failed to connect to MySQL database', time: '3 hours ago', status: 'Failed' },
    { id: 4, action: 'Generated SQL for "Revenue by month"', time: '5 hours ago', status: 'Success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-text-primary">{activity.action}</span>
                    <span className="text-xs text-text-secondary">{activity.time}</span>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    activity.status === 'Success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <a href="/upload" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm font-medium text-text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              Upload new dataset
            </a>
            <a href="/connect" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm font-medium text-text-primary">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <Database className="w-4 h-4" />
              </div>
              Connect Database
            </a>
            <a href="/query" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm font-medium text-text-primary">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <Terminal className="w-4 h-4" />
              </div>
              Start querying
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
