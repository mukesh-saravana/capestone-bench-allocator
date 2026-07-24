import { Box, LinearProgress, Typography } from '@mui/material';
import { tokens } from '../../theme';

interface ProgressBarProps {
  value: number; // 0–100
  showLabel?: boolean;
  height?: number;
}

function getColor(value: number) {
  if (value >= 80) return tokens.colors.success;
  if (value >= 50) return tokens.colors.warning;
  return tokens.colors.danger;
}

export function ProgressBar({ value, showLabel = false, height = 8 }: ProgressBarProps) {
  const color = getColor(value);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flex: 1, height, borderRadius: height / 2,
          bgcolor: tokens.colors.neutral,
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: height / 2 },
        }}
      />
      {showLabel && (
        <Typography variant="body2" sx={{ minWidth: 36, color, fontWeight: 600 }}>
          {value}%
        </Typography>
      )}
    </Box>
  );
}
