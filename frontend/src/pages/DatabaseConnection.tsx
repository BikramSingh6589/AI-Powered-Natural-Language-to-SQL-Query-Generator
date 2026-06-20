import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Database, Server, Key, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const connectionSchema = z.object({
  type: z.enum(['postgresql', 'mysql', 'sqlite']),
  host: z.string().min(1, 'Host is required'),
  port: z.string().regex(/^\d+$/, 'Port must be a number'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

export const DatabaseConnection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'postgresql' | 'mysql' | 'sqlite'>('postgresql');
  const [isTesting, setIsTesting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      type: 'postgresql',
      port: '5432',
    }
  });

  const handleTabChange = (type: 'postgresql' | 'mysql' | 'sqlite') => {
    setActiveTab(type);
    setValue('type', type);
    setValue('port', type === 'postgresql' ? '5432' : type === 'mysql' ? '3306' : '');
  };

  const handleTestConnection = async (data: ConnectionFormValues) => {
    setIsTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Connection successful!');
    } catch (error) {
      toast.error('Failed to connect to the database');
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: ConnectionFormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Database configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Connect Database</h2>
        <p className="text-text-secondary mt-1">Connect your existing database securely to start generating SQL queries.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => handleTabChange('postgresql')}
            className={`w-full flex items-center gap-3 p-4 rounded-[12px] border transition-colors text-left ${activeTab === 'postgresql' ? 'bg-primary/5 border-primary text-primary' : 'bg-card border-border hover:bg-background text-text-primary'}`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">PostgreSQL</span>
          </button>
          <button 
            onClick={() => handleTabChange('mysql')}
            className={`w-full flex items-center gap-3 p-4 rounded-[12px] border transition-colors text-left ${activeTab === 'mysql' ? 'bg-primary/5 border-primary text-primary' : 'bg-card border-border hover:bg-background text-text-primary'}`}
          >
            <Server className="w-5 h-5" />
            <span className="font-medium">MySQL</span>
          </button>
          <button 
            onClick={() => handleTabChange('sqlite')}
            className={`w-full flex items-center gap-3 p-4 rounded-[12px] border transition-colors text-left ${activeTab === 'sqlite' ? 'bg-primary/5 border-primary text-primary' : 'bg-card border-border hover:bg-background text-text-primary'}`}
          >
            <Key className="w-5 h-5" />
            <span className="font-medium">SQLite</span>
          </button>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{activeTab} Connection</CardTitle>
              <CardDescription>Enter your database credentials. They will be encrypted securely.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="db-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {activeTab !== 'sqlite' ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-text-primary mb-1.5 block">Host</label>
                        <Input
                          placeholder="localhost or db.example.com"
                          {...register('host')}
                          error={!!errors.host}
                          helperText={errors.host?.message}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-sm font-medium text-text-primary mb-1.5 block">Port</label>
                        <Input
                          placeholder="5432"
                          {...register('port')}
                          error={!!errors.port}
                          helperText={errors.port?.message}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-1.5 block">Database Name</label>
                      <Input
                        placeholder="postgres"
                        {...register('database')}
                        error={!!errors.database}
                        helperText={errors.database?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-1.5 block">Username</label>
                        <Input
                          placeholder="admin"
                          {...register('username')}
                          error={!!errors.username}
                          helperText={errors.username?.message}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-1.5 block">Password</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...register('password')}
                          error={!!errors.password}
                          helperText={errors.password?.message}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-1.5 block">File Path or URL</label>
                    <Input
                      placeholder="/path/to/database.sqlite"
                      {...register('host')} // Reusing host for filepath in sqlite for simplicity
                      error={!!errors.host}
                      helperText={errors.host?.message}
                    />
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border bg-background/50 py-4">
              <Button 
                variant="secondary" 
                onClick={handleSubmit(handleTestConnection)}
                isLoading={isTesting}
                disabled={isSubmitting}
                className="gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Test Connection
              </Button>
              <Button form="db-form" type="submit" isLoading={isSubmitting} disabled={isTesting}>
                Save Connection
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
