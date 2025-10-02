'use client';

import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/utils';
import type { RegisterData } from '@/types';

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4); // 0..4
}

export function RegisterForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const strength = useMemo(() => passwordStrength(passwordValue || ''), [passwordValue]);

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    setError('');

    try {
      await registerUser(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register('name')}
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
        />

        <Input
          {...register('email')}
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          error={errors.email?.message}
        />

        <div className="space-y-2">
          <Input
            {...register('password')}
            type="password"
            label="Password"
            placeholder="Create a strong password"
            error={errors.password?.message}
          />
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                strength <= 1 ? 'bg-red-500 w-1/4' : strength === 2 ? 'bg-orange-500 w-2/4' : strength === 3 ? 'bg-yellow-500 w-3/4' : 'bg-green-600 w-full'
              }`}
            />
          </div>
          <p className="text-xs text-gray-600">
            Use at least 8 characters with upper/lowercase, numbers, and a symbol for a stronger password.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full text-lg font-semibold"
        size="lg"
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
