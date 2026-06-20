import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileUpdate = async (data: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordUpdate = async (data: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      resetPasswordForm();
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Profile Information</h2>
        <p className="text-text-secondary mt-1">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-text-secondary" /> Full Name
              </label>
              <Input
                {...registerProfile('name')}
                error={!!profileErrors.name}
                helperText={profileErrors.name?.message?.toString()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-secondary" /> Email Address
              </label>
              <Input
                type="email"
                {...registerProfile('email')}
                error={!!profileErrors.email}
                helperText={profileErrors.email?.message?.toString()}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-border bg-background/50 pt-6">
          <Button type="submit" form="profile-form" isLoading={isProfileSubmitting}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="password-form" onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-text-secondary" /> Current Password
              </label>
              <Input
                type="password"
                {...registerPassword('currentPassword')}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message?.toString()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">New Password</label>
              <Input
                type="password"
                {...registerPassword('newPassword')}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message?.toString()}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Confirm New Password</label>
              <Input
                type="password"
                {...registerPassword('confirmPassword')}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword?.message?.toString()}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-border bg-background/50 pt-6">
          <Button type="submit" form="password-form" isLoading={isPasswordSubmitting}>
            Update Password
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-error/20">
        <CardHeader>
          <CardTitle className="text-error flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="error" title="Warning">
            Once you delete your account, there is no going back. Please be certain.
          </Alert>
        </CardContent>
        <CardFooter className="border-t border-border bg-error/5 pt-6">
          <Button variant="danger">
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
