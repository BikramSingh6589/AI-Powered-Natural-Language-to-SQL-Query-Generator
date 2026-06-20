import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../services/api';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OTPFormValues = z.infer<typeof otpSchema>;

export const OTPVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
  });

  // Redirect if no email in state
  React.useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  const onSubmit = async (data: OTPFormValues) => {
    try {
      await api.post('/auth/verify-otp', { email, otp: data.otp });
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    toast.info('A new OTP has been sent to your email.');
  };

  if (!email) return null;

  return (
    <Card className="w-full max-w-[420px] mx-auto mt-10">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>We sent a 6-digit code to <span className="font-medium text-text-primary">{email}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-lg tracking-widest"
            {...register('otp')}
            error={!!errors.otp}
            helperText={errors.otp?.message}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Verify Email
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary flex items-center justify-center gap-1">
          Didn't receive the code?
          <Button variant="ghost" className="h-auto p-0 px-1 text-primary hover:bg-transparent hover:underline" onClick={handleResend}>
            Resend
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
