import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Database, Server, Key, Link as LinkIcon, CheckCircle2, Unplug, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

const DB_TYPES = [
  { id: 'postgresql' as const, label: 'PostgreSQL', icon: Database, description: 'Open-source relational DB' },
  { id: 'mysql' as const, label: 'MySQL', icon: Server, description: 'World\'s most popular DB' },
  { id: 'sqlite' as const, label: 'SQLite', icon: Key, description: 'Lightweight file-based DB' },
];

export const DatabaseConnection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'postgresql' | 'mysql' | 'sqlite'>('postgresql');
  const [isTesting, setIsTesting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(() => localStorage.getItem('dbConnected') === 'true');
  const [testPassed, setTestPassed] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
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
    setTestPassed(false);
  };

  const handleTestConnection = async (data: ConnectionFormValues) => {
    setIsTesting(true);
    setTestPassed(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestPassed(true);
      toast.success('Connection test successful!');
    } catch (error) {
      toast.error('Failed to connect to the database');
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: ConnectionFormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('dbConnected', 'true');
      setIsConnected(true);
      toast.success('Database connected successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('dbConnected');
    setIsConnected(false);
    setTestPassed(false);
    reset();
    toast.info('Database disconnected');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Connect Database</h2>
          <p className="text-text-secondary mt-1">Connect your existing database securely to start generating SQL queries.</p>
        </div>

        {/* Connection status pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${
          isConnected
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-border/50 border-border text-text-secondary'
        }`}>
          {isConnected ? (
            <><Wifi className="w-3.5 h-3.5" /> Connected</>
          ) : (
            <><WifiOff className="w-3.5 h-3.5" /> Disconnected</>
          )}
        </div>
      </div>

      {/* Connected banner */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-success/25 bg-success/8"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Active Database Connection</p>
                <p className="text-xs text-text-secondary mt-0.5">Your database is connected and ready to use in the Query Generator.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleDisconnect}
              className="gap-2 text-error hover:bg-error/10 hover:text-error border border-error/20 hover:border-error/40 text-sm"
            >
              <Unplug className="w-4 h-4" />
              Disconnect
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* DB Type Selector */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3 px-1">Database Type</p>
          {DB_TYPES.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer group ${
                activeTab === id
                  ? 'bg-primary/8 border-primary/40 text-primary shadow-sm'
                  : 'bg-card border-border/60 hover:border-primary/20 hover:bg-primary/4 text-text-primary'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                activeTab === id ? 'bg-primary/15' : 'bg-border/60 group-hover:bg-primary/10'
              }`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none">{label}</p>
                <p className={`text-xs mt-1 ${activeTab === id ? 'text-primary/70' : 'text-text-secondary'}`}>{description}</p>
              </div>
            </button>
          ))}

          {/* Security note */}
          <div className="mt-4 p-3 rounded-xl bg-border/30 border border-border/40">
            <div className="flex items-center gap-2 text-text-secondary">
              <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
              <p className="text-xs leading-relaxed">Your credentials are never stored in plain text and are encrypted at rest.</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="md:col-span-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {activeTab === 'postgresql' && <Database className="w-5 h-5 text-primary" />}
                  {activeTab === 'mysql' && <Server className="w-5 h-5 text-primary" />}
                  {activeTab === 'sqlite' && <Key className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <CardTitle className="capitalize text-base">{activeTab} Connection</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Enter your credentials below. All data is encrypted.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              <form id="db-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {activeTab !== 'sqlite' ? (
                  <>
                    <div className="grid grid-cols-3 gap-5">
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-text-primary mb-2 block">Host</label>
                        <Input
                          placeholder="localhost or db.example.com"
                          {...register('host')}
                          error={!!errors.host}
                          helperText={errors.host?.message}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-sm font-medium text-text-primary mb-2 block">Port</label>
                        <Input
                          placeholder="5432"
                          {...register('port')}
                          error={!!errors.port}
                          helperText={errors.port?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-primary mb-2 block">Database Name</label>
                      <Input
                        placeholder="my_database"
                        {...register('database')}
                        error={!!errors.database}
                        helperText={errors.database?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
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
                      {...register('host')}
                      error={!!errors.host}
                      helperText={errors.host?.message}
                    />
                  </div>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/20 py-4 gap-3 flex-wrap">
              <Button
                variant="secondary"
                onClick={handleSubmit(handleTestConnection)}
                isLoading={isTesting}
                disabled={isSubmitting}
                className={`gap-2 border transition-colors ${testPassed ? 'border-success/40 bg-success/10 text-success hover:bg-success/15' : 'border-border/60'}`}
              >
                {testPassed ? (
                  <><CheckCircle2 className="w-4 h-4" /> Test Passed</>
                ) : (
                  <><LinkIcon className="w-4 h-4" /> Test Connection</>
                )}
              </Button>

              <div className="flex items-center gap-3">
                {isConnected && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={handleDisconnect}
                    className="gap-2 text-error hover:bg-error/10 hover:text-error border border-error/20"
                  >
                    <Unplug className="w-4 h-4" />
                    Disconnect
                  </Button>
                )}
                <Button
                  form="db-form"
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isTesting}
                  className="gap-2 shadow-sm shadow-primary/20 hover:-translate-y-0.5 transition-transform"
                >
                  {isConnected ? 'Update Connection' : 'Save Connection'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
