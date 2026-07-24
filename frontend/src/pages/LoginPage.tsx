import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../store/AuthContext';
import { tokens } from '../theme';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionExpired = searchParams.get('reason') === 'expired';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: tokens.colors.neutralDark, p: 2,
      }}
    >
      {/* Logo + Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: 48, lineHeight: 1 }}>🏢</Typography>
        <Typography variant="h1" sx={{ mt: 1, fontSize: '1.75rem' }}>Bench Allocator</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>AI-assisted resource allocation</Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          {sessionExpired && (
            <Alert severity="warning" sx={{ mb: 2 }}>Your session expired. Please sign in again.</Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth label="Email" type="email" sx={{ mb: 2 }}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
            />
            <TextField
              fullWidth label="Password" sx={{ mb: 3 }}
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Password must be at least 4 characters' } })}
            />

            <Button
              type="submit" variant="contained" fullWidth size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="text" size="small" sx={{ color: 'text.secondary' }}>
              Forgot password?
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
