import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../services/api';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: passedEmail,
      otp: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      await api.post('/auth/reset-password', {
        email: data.email,
        otp: data.otp,
        password: data.password
      });
      toast.success('Password has been reset successfully! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Please verify your OTP.');
    }
  };

  return (
    <Card className="w-full max-w-[420px] mx-auto mt-10">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <LockKeyhole className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Enter the 6-digit OTP code sent to your email to verify and reset your password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Your email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              readOnly={!!passedEmail}
              className={passedEmail ? 'bg-muted opacity-80 cursor-not-allowed' : ''}
            />
            <Input
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="text-center tracking-widest font-mono"
              {...register('otp')}
              error={!!errors.otp}
              helperText={errors.otp?.message}
            />
            <Input
              type="password"
              placeholder="New Password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Reset password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
