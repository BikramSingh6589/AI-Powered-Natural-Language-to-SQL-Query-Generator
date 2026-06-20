import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Database } from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';

import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      toast.success('Account created! Please verify your OTP.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();
        const googleUser = {
          id: profile.sub || 'google_user',
          name: profile.name || 'Google User',
          email: profile.email || '',
          picture: profile.picture || '',
          provider: 'google' as const,
        };
        login(googleUser, tokenResponse.access_token);
        toast.success(`Account created! Welcome, ${googleUser.name}! 🎉`);
        navigate('/dashboard', { replace: true });
      } catch {
        toast.error('Failed to fetch Google profile');
      }
    },
    onError: () => toast.error('Google sign-up was cancelled or failed.'),
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
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription className="mt-1">Start turning natural language into SQL today</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={() => handleGoogleSignup()}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border font-medium text-sm transition-all hover:shadow-md active:scale-[0.99]"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
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
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>or register with email</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Full Name</label>
            <Input
              placeholder="John Doe"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </div>
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
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
            <Input
              type="password"
              placeholder="Min 8 characters"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
