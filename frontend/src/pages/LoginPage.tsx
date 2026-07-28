import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress, Chip,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      background: `linear-gradient(135deg, ${tokens.colors.sidebarBg} 0%, #1E293B 40%, #0F2044 100%)`,
    }}>
      {/* Left panel — branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' }, flex: 1, flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start', px: 8,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: `${tokens.colors.primary}15`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: `${tokens.colors.success}10`, pointerEvents: 'none' }} />

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: tokens.gradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: tokens.shadows.colored(tokens.colors.primary) }}>
              <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF' }}>Bench Allocator</Typography>
          </Box>
          <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-0.04em', mb: 2 }}>
            AI-powered<br />staffing decisions
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'rgba(148,163,184,0.9)', lineHeight: 1.7, maxWidth: 380 }}>
            Match engineers to projects using RAG-assisted recommendations and real-time utilization analytics.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {['RAG Pipeline', 'Skill Matching', 'Bench Analytics', 'Human Approval'].map((f) => (
            <Chip key={f} label={f} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.75rem' }} />
          ))}
        </Box>
      </Box>

      {/* Right panel — form */}
      <Box sx={{
        width: { xs: '100%', md: 480 }, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        bgcolor: 'white', px: { xs: 3, sm: 6 }, py: 6,
        boxShadow: '-20px 0 60px rgba(0,0,0,0.2)',
      }}>
        <Box sx={{ width: '100%', maxWidth: 360 }}>
          {/* Icon */}
          <Box sx={{
            width: 52, height: 52, borderRadius: 2.5, background: tokens.gradients.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: tokens.shadows.colored(tokens.colors.primary), mb: 3,
          }}>
            <LockOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>

          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: tokens.colors.text, mb: 0.5, letterSpacing: '-0.03em' }}>
            Welcome back
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: tokens.colors.textTertiary, mb: 3 }}>
            Sign in to your account to continue
          </Typography>

          {sessionExpired && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>Your session expired. Please sign in again.</Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.colors.textSecondary, mb: 0.75 }}>Email</Typography>
            <TextField
              fullWidth type="email" sx={{ mb: 2.5 }}
              placeholder="you@company.com"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
            />

            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: tokens.colors.textSecondary, mb: 0.75 }}>Password</Typography>
            <TextField
              fullWidth sx={{ mb: 3 }}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Minimum 4 characters' } })}
            />

            <Button
              type="submit" variant="contained" fullWidth
              size="large" disabled={isSubmitting}
              sx={{ py: 1.5, fontSize: '0.9375rem', borderRadius: 2 }}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 2.5, textAlign: 'center' }}>
            <Button variant="text" size="small" sx={{ color: tokens.colors.textTertiary, fontSize: '0.8rem' }}>
              Forgot password?
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${tokens.colors.border}`, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.textTertiary }}>
              Demo: use manager@company.com / demo1234 or any email with password 4+ chars
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
