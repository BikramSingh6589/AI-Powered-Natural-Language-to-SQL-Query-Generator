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
import { api } from '../services/api';
import { useRotatingBorder } from '../hooks/useRotatingBorder';

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
  const cardRef = useRotatingBorder();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await api.post('/auth/register', { name: data.name, email: data.email, password: data.password });
      toast.success('Account created! Please verify your OTP.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post('/auth/google', { token: tokenResponse.access_token });
        const { user, tokens } = response.data.data;
        
        login(user, tokens.accessToken);
        toast.success(`Account created! Welcome, ${user.name}! 🎉`);
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to authenticate with Google');
      }
    },
    onError: () => toast.error('Google sign-up was cancelled or failed.'),
  });

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden">
    <div ref={cardRef} className="w-[90%] h-[90%] flex flex-col lg:flex-row-reverse rotating-border-card rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Right Side - Form (Reversed to match Login's flow visually or just keep it on the left) */}
      {/* Actually, let's keep it on the left so it matches Login perfectly */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto px-8 sm:px-14 py-8 lg:max-w-xl relative z-10 bg-background/50 backdrop-blur-md">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}>
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Create an account</h1>
            <p className="text-text-secondary mt-1 font-medium text-sm">Start turning natural language into SQL today.</p>
          </div>

          <button
            type="button"
            onClick={() => handleGoogleSignup()}
            className="w-full flex items-center justify-center gap-3 h-10 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:scale-[0.99] bg-muted/30 hover:bg-muted/50 text-text-primary border border-border/50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.4-7.6 19.4-19.5 0-1.3-.2-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.8 29.5 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
              <path fill="#4CAF50" d="M24 43.5c5.2 0 10-1.9 13.7-5l-6.3-5.3C29.7 34.9 27 36 24 36c-5.3 0-9.7-3-11.3-7.5L6.1 33.7C9.4 39.2 16.2 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.3 5.3c-.4.4 6.7-4.9 6.7-14.8 0-1.3-.2-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-primary">Full Name</label>
              <Input
                placeholder="John Doe"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                className="h-10 bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-primary">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  onBlur: async (e) => {
                    const emailVal = e.target.value;
                    if (emailVal && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                      try {
                        const res = await api.get(`/auth/check-email?email=${encodeURIComponent(emailVal)}`);
                        if (res.data.data.isRegistered) {
                          toast.error('This email is already registered. Please sign in instead.');
                        }
                      } catch (error) {
                        // ignore check errors
                      }
                    }
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                className="h-10 bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-primary">Password</label>
              <Input
                type="password"
                placeholder="Min 8 characters"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                className="h-10 bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-text-primary">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                className="h-10 bg-background/50 border-border/50"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 mt-2" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm font-medium text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visuals (Matches Login page) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(230,40%,9%) 100%)' }}>
        {/* Glow Orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-[40%] left-[15%] w-[200px] h-[200px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        {/* Decorative Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Floating SQL Widgets */}
        <div className="relative z-10 w-full max-w-sm flex flex-col gap-5">
          {/* Widget 1: SQL Generation */}
          <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform -translate-x-6 hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-text-secondary ml-1 font-mono">nl_to_sql</span>
            </div>
            <div className="p-2.5 bg-white/5 rounded-lg mb-3 border border-white/10">
              <p className="text-xs text-text-primary font-medium">"Top 5 customers by revenue"</p>
            </div>
            <div className="font-mono text-xs leading-relaxed">
              <p><span className="text-blue-400">SELECT</span> <span className="text-text-primary">customer_name, sum(revenue)</span></p>
              <p><span className="text-blue-400">FROM</span> <span className="text-green-400">sales</span></p>
              <p><span className="text-blue-400">GROUP BY</span> <span className="text-text-primary">customer_name</span></p>
              <p><span className="text-blue-400">ORDER BY</span> <span className="text-text-primary">sum(revenue) </span><span className="text-purple-400">DESC</span></p>
              <p><span className="text-purple-400">LIMIT</span> <span className="text-yellow-400">5</span><span className="text-text-primary">;</span></p>
            </div>
          </div>

          {/* Widget 2: Setup Process */}
          <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform translate-x-4 hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center border border-success/30">
                <div className="w-2.5 h-2.5 rounded-full bg-success" />
              </div>
              <span className="font-bold text-text-primary text-sm">1. Connect Database</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              </div>
              <span className="font-bold text-text-primary text-sm">2. Generate Queries</span>
            </div>
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center border border-border">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              <span className="font-bold text-text-secondary text-sm">3. Analyze Data</span>
            </div>
          </div>

          {/* Widget 3: Table Schema Preview */}
          <div className="bg-card/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform -translate-x-3 hover:-translate-y-1 transition-transform duration-500">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Table: users</span>
              <span className="text-xs font-mono text-primary">3 cols</span>
            </div>
            <div className="space-y-2">
              {[{col: 'id', type: 'INT', pk: true}, {col: 'email', type: 'VARCHAR'}, {col: 'created_at', type: 'TIMESTAMP'}].map((row) => (
                <div key={row.col} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    {row.pk && <span className="text-yellow-400 text-xs">🔑</span>}
                    <span className="font-mono text-xs text-text-primary">{row.col}</span>
                  </div>
                  <span className="font-mono text-xs text-primary/70">{row.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
