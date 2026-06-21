import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsSubmitted(true);
      toast.success('OTP sent to your email! Please check your inbox.');
      
      // Delay navigation slightly so they can see the success toast / state
      setTimeout(() => {
        navigate('/reset-password', { state: { email: data.email } });
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset code. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-[420px] mx-auto mt-10">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          {isSubmitted 
            ? "We've sent you an email with a link to reset your password."
            : "No worries, we'll send you reset instructions."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Reset password
            </Button>
          </form>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setIsSubmitted(false)}>
            Did not receive the email? Try again
          </Button>
        )}

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2">
            <span aria-hidden="true">&larr;</span> Back to log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
