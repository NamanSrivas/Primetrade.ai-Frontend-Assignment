"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { updateProfileSchema, changePasswordSchema } from '@/lib/validations';
import { useToast } from '@/contexts/ToastContext';

type ProfileForm = {
  name?: string;
  bio?: string;
  profilePicture?: string;
};

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const { show: showToast } = useToast();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      profilePicture: user?.profilePicture || '',
    },
  });

  const passwordForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const res = await authApi.updateProfile(data);
      updateUser(res.user);
      showToast('Profile updated', 'success');
    } catch (e) {
      showToast('Failed to update profile', 'error');
    }
  };

  const onChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      passwordForm.reset();
      showToast('Password changed', 'success');
    } catch (e) {
      showToast('Failed to change password', 'error');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>← Back to dashboard</Button>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <Input label="Name" {...profileForm.register('name')} error={profileForm.formState.errors.name?.message} />
                <Input label="Bio" {...profileForm.register('bio')} error={profileForm.formState.errors.bio?.message} />
                <Input label="Profile picture URL" {...profileForm.register('profilePicture')} error={profileForm.formState.errors.profilePicture?.message} />
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <Input type="password" label="Current Password" {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} />
                <Input type="password" label="New Password" {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message} />
                <Input type="password" label="Confirm New Password" {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message} />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
