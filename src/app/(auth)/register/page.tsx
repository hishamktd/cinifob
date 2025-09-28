'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';

import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { AppIcon, AppButton } from '@core/components';
import { APP_CONFIG, ROUTES } from '@core/constants';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(ROUTES.API.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <AppIcon icon="mdi:movie-open-outline" size={48} color="primary" />
              <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
                {APP_CONFIG.NAME}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name', {
                  required: 'Name is required',
                })}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        <AppIcon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                margin="normal"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        <AppIcon icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <AppButton
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                loading={loading}
              >
                Sign Up
              </AppButton>
            </form>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Typography variant="body2" align="center">
              Already have an account?{' '}
              <Link href={ROUTES.LOGIN} style={{ color: 'inherit' }}>
                <strong>Sign in</strong>
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
