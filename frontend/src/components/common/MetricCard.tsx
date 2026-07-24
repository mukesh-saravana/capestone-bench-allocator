import { Card, CardContent, Box, Typography, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';
import { tokens } from '../../theme';

type AccentColor = 'success' | 'warning' | 'danger' | 'primary' | 'none';

const accentMap: Record<AccentColor, string> = {
  success: tokens.colors.success,
  warning: tokens.colors.warning,
  danger: tokens.colors.danger,
  primary: tokens.colors.primary,
  none: 'transparent',
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: AccentColor;
  action?: ReactNode;
  children?: ReactNode;
  sx?: SxProps;
}

export function MetricCard({ title, value, subtitle, accent = 'none', action, children, sx }: MetricCardProps) {
  return (
    <Card
      sx={{
        borderLeft: `4px solid ${accentMap[accent]}`,
        height: '100%',
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h3" color="text.secondary">{title}</Typography>
          {action}
        </Box>
        <Typography
          sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, color: accentMap[accent] !== 'transparent' ? accentMap[accent] : 'text.primary', mb: 0.5 }}
        >
          {value}
        </Typography>
        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
        {children}
      </CardContent>
    </Card>
  );
}
