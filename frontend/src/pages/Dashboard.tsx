import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, Terminal, Activity, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardStats {
  totalQueries: number;
  totalDatasets: number;
  successfulQueries: number;
  recentActivity: {
    id: string;
    action: string;
    time: string;
    status: 'SUCCESS' | 'ERROR';
  }[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [historyRes, datasetsRes] = await Promise.all([
          api.get('/history?limit=5'),
          api.get('/csv/datasets'),
        ]);

        const history = historyRes.data.data.history || [];
        const datasets = datasetsRes.data.data.datasets || [];
        const totalQueries = historyRes.data.data.total || history.length;
        const successfulQueries = history.filter((h: any) => h.status === 'SUCCESS').length;

        setStats({
          totalQueries,
          totalDatasets: datasets.length,
          successfulQueries,
          recentActivity: history.slice(0, 4).map((h: any) => ({
            id: h.id,
            action: h.naturalQuery,
            time: new Date(h.createdAt).toLocaleString(),
            status: h.status,
          })),
        });
      } catch (error: any) {
        // If API fails silently, show empty state
        setStats({
          totalQueries: 0,
          totalDatasets: 0,
          successfulQueries: 0,
          recentActivity: [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = stats ? [
    { title: 'Total Queries', value: stats.totalQueries.toLocaleString(), icon: Terminal, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Uploaded Datasets', value: stats.totalDatasets.toString(), icon: FileSpreadsheet, color: 'text-secondary', bg: 'bg-secondary/10' },
    { title: 'Successful SQL', value: stats.successfulQueries.toLocaleString(), icon: Database, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Success Rate', value: stats.totalQueries > 0 ? `${Math.round((stats.successfulQueries / stats.totalQueries) * 100)}%` : '—', icon: Activity, color: 'text-warning', bg: 'bg-warning/10' },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="text-text-secondary mt-1">Here's what's happening with your queries.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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
            {stats?.recentActivity.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-8">No recent activity. Start by uploading a dataset!</p>
            ) : (
              <div className="space-y-4">
                {stats?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-text-primary truncate max-w-xs">{activity.action}</span>
                      <span className="text-xs text-text-secondary">{activity.time}</span>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.status === 'SUCCESS' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {activity.status === 'SUCCESS' ? 'Success' : 'Failed'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link to="/upload" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm font-medium text-text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              Upload new dataset
            </Link>
            <Link to="/query" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm font-medium text-text-primary">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <Terminal className="w-4 h-4" />
              </div>
              Start querying
            </Link>
            <Link to="/history" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background transition-colors text-sm font-medium text-text-primary">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <Activity className="w-4 h-4" />
              </div>
              View query history
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
