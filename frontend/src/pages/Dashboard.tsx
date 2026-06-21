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
          api.get('/query/history?limit=5'),
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
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h2>
          <p className="text-text-secondary mt-2 text-lg">Here's what's happening with your queries.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={stat.title} className="relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-sm">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-transparent to-${stat.color.split('-')[1]} transition-opacity duration-300`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold tracking-wide text-text-secondary uppercase">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} border border-${stat.color.split('-')[1]}/20 flex items-center justify-center shadow-sm`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-text-primary tracking-tight">{stat.value}</div>
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
              <div className="space-y-2">
                {stats?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-background/30 hover:bg-muted/40 hover:border-border transition-all duration-200 group">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate max-w-[280px] sm:max-w-md">{activity.action}</span>
                      <span className="text-[11px] font-medium text-text-secondary tracking-wide">{activity.time}</span>
                    </div>
                    <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border shadow-sm ${
                      activity.status === 'SUCCESS' 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-error/10 text-error border-error/20'
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
            <Link to="/upload" className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Upload new dataset</p>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">Add CSV files to your database</p>
              </div>
            </Link>
            <Link to="/query" className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-warning/5 hover:border-warning/30 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20 group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Start querying</p>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">Generate SQL from natural language</p>
              </div>
            </Link>
            <Link to="/history" className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-secondary/5 hover:border-secondary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">View query history</p>
                <p className="text-xs text-text-secondary mt-0.5 font-medium">Access your past executions</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
