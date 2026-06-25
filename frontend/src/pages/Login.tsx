import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Database, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';

import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../services/api';
import { useRotatingBorder } from '../hooks/useRotatingBorder';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const cardRef = useRotatingBorder();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', { email: data.email, password: data.password });
      const { user, tokens } = response.data.data;
      login(user, tokens.accessToken);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password';
      if (message.toLowerCase().includes('user not registered')) {
        setError('email', { type: 'manual', message: 'User not registered' });
      } else if (message.toLowerCase().includes('password')) {
        setError('password', { type: 'manual', message: 'Incorrect password' });
      } else {
        toast.error(message);
      }
    }
  };

  // Google OAuth via token flow (most compatible)
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post('/auth/google', { token: tokenResponse.access_token });
        const { user, tokens } = response.data.data;
        
        login(user, tokens.accessToken);
        toast.success(`Welcome, ${user.name}! 🎉`);
        navigate(from, { replace: true });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to authenticate with Google');
      }
    },
    onError: () => {
      toast.error('Google sign-in was cancelled or failed.');
    },
  });

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden">
    <div ref={cardRef} className="w-[95%] h-[95%] flex flex-col lg:flex-row rotating-border-card rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 py-12 lg:max-w-xl relative z-10 bg-background/50 backdrop-blur-md">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}>
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Welcome Back!</h1>
            <p className="text-text-secondary mt-2 font-medium">Sign in to your SQL Analyzer cockpit.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">Email</label>
              <Input
                type="email"
                placeholder="Your email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                className="h-12 bg-background/50 border-border/50 focus:bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-primary">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                className="h-12 bg-background/50 border-border/50 focus:bg-background"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 mt-2" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:scale-[0.99] bg-muted/30 hover:bg-muted/50 text-text-primary border border-border/50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.4-7.6 19.4-19.5 0-1.3-.2-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
              <path fill="#4CAF50" d="M24 43.5c5.2 0 10-1.9 13.7-5l-6.3-5.3C29.7 34.9 27 36 24 36c-5.3 0-9.7-3-11.3-7.5L6.1 33.7C9.4 39.2 16.2 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.3 5.3c-.4.4 6.7-4.9 6.7-14.8 0-1.3-.2-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm font-medium text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(220,40%,10%) 100%)' }}>
        {/* Glow Orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-[45%] right-[10%] w-[200px] h-[200px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        {/* Decorative Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Floating SQL Widgets */}
        <div className="relative z-10 w-full max-w-sm flex flex-col gap-5">
          {/* Widget 1: Database Status */}
          <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform translate-x-6 hover:-translate-y-1 transition-transform duration-500">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Database</span>
              <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-text-primary tracking-tight">12.4</span>
              <span className="text-sm font-bold text-text-secondary mb-0.5">GB Data</span>
            </div>
          </div>

          {/* Widget 2: Query Performance */}
          <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform -translate-x-4 hover:-translate-y-1 transition-transform duration-500">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Queries Executed</span>
              <span className="text-xs font-bold text-text-primary">Today</span>
            </div>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-black text-text-primary tracking-tight">892</span>
              <span className="text-xs font-bold text-success mb-1">↑ 12%</span>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[40, 60, 45, 80, 55, 90, 65, 100, 75, 40, 60, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm"
                     style={{ height: `${h}%`, backgroundColor: i > 8 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-3">Increase <span className="text-success font-bold">12%</span> this month</p>
          </div>

          {/* Widget 3: Recent SQL Query */}
          <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform translate-x-3 hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-text-secondary ml-1 font-mono">query.sql</span>
            </div>
            <div className="font-mono text-xs leading-relaxed">
              <p><span className="text-blue-400">SELECT</span> <span className="text-text-primary">user_id, revenue</span></p>
              <p><span className="text-blue-400">FROM</span> <span className="text-green-400">transactions</span></p>
              <p><span className="text-blue-400">WHERE</span> <span className="text-text-primary">date </span><span className="text-yellow-400">&gt;</span><span className="text-text-primary"> '2024-01'</span></p>
              <p><span className="text-blue-400">ORDER BY</span> <span className="text-text-primary">revenue </span><span className="text-purple-400">DESC</span><span className="text-text-primary">;</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
