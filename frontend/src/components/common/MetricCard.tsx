import { Box, Typography, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { tokens } from '../../theme';

type AccentColor = 'success' | 'warning' | 'danger' | 'primary' | 'none';

const accentConfig: Record<AccentColor, { gradient: string; color: string; glow: string }> = {
  success: { gradient: tokens.gradients.success,  color: tokens.colors.success,  glow: `${tokens.colors.success}25` },
  warning: { gradient: tokens.gradients.warning,  color: tokens.colors.warning,  glow: `${tokens.colors.warning}25` },
  danger:  { gradient: tokens.gradients.danger,   color: tokens.colors.danger,   glow: `${tokens.colors.danger}25` },
  primary: { gradient: tokens.gradients.primary,  color: tokens.colors.primary,  glow: `${tokens.colors.primary}25` },
  none:    { gradient: 'none', color: tokens.colors.text, glow: 'transparent' },
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: AccentColor;
  icon?: ReactNode;
  trend?: { value: number; label?: string }; // positive = up, negative = down
  action?: ReactNode;
  children?: ReactNode;
  sx?: SxProps;
}

export function MetricCard({ title, value, subtitle, accent = 'none', icon, trend, action, children, sx }: MetricCardProps) {
  const cfg = accentConfig[accent];
  const hasTrend = trend !== undefined;
  const trendUp = (trend?.value ?? 0) >= 0;

  return (
    <Box
      sx={{
        bgcolor: 'white',
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: `${tokens.borderRadius.md}px`,
        overflow: 'hidden',
        boxShadow: tokens.shadows.sm,
        transition: 'all 220ms ease',
        height: '100%',
        display: 'flex', flexDirection: 'column',
        '&:hover': { boxShadow: tokens.shadows.md, transform: 'translateY(-2px)' },
        ...sx,
      }}
    >
      {/* Gradient accent strip */}
      {accent !== 'none' && (
        <Box sx={{ height: 4, background: cfg.gradient, flexShrink: 0 }} />
      )}

      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            sx={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {action}
            {icon && (
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                background: accent !== 'none' ? `${cfg.glow}` : tokens.colors.neutralDark,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent !== 'none' ? cfg.color : tokens.colors.textTertiary,
              }}>
                {icon}
              </Box>
            )}
          </Box>
        </Box>

        {/* Value */}
        <Typography
          sx={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: tokens.colors.text, mb: 0.5 }}
        >
          {value}
        </Typography>

        {/* Subtitle + trend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
          {subtitle && (
            <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.textTertiary }}>{subtitle}</Typography>
          )}
          {hasTrend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 'auto' }}>
              {trendUp
                ? <TrendingUpIcon sx={{ fontSize: 14, color: tokens.colors.success }} />
                : <TrendingDownIcon sx={{ fontSize: 14, color: tokens.colors.danger }} />}
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: trendUp ? tokens.colors.success : tokens.colors.danger }}>
                {trendUp ? '+' : ''}{trend!.value}%
              </Typography>
              {trend?.label && (
                <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.textTertiary }}>{trend.label}</Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Child content (charts, progress bars) */}
        {children && <Box sx={{ mt: 1.5, flex: 1 }}>{children}</Box>}
      </Box>
    </Box>
  );
}
