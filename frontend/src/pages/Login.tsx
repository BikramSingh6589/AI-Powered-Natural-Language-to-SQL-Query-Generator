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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
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
      toast.error(error.response?.data?.message || 'Invalid email or password');
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
    <Card className="w-full max-w-[440px] mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
          >
            <Database className="w-7 h-7 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription className="mt-1">Sign in to your SQL Analyzer account</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border font-medium text-sm transition-all hover:shadow-md active:scale-[0.99]"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Official Google G logo SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.4-7.6 19.4-19.5 0-1.3-.2-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
            <path fill="#4CAF50" d="M24 43.5c5.2 0 10-1.9 13.7-5l-6.3-5.3C29.7 34.9 27 36 24 36c-5.3 0-9.7-3-11.3-7.5L6.1 33.7C9.4 39.2 16.2 43.5 24 43.5z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.3 5.3c-.4.4 6.7-4.9 6.7-14.8 0-1.3-.2-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>or sign in with email</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
