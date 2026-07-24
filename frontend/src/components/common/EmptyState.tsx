import { Box, Typography, type SxProps } from '@mui/material';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  sx?: SxProps;
}

export function EmptyState({ title, description, action, sx }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', py: 6, px: 2, textAlign: 'center', ...sx,
      }}
    >
      <InboxOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h3" sx={{ mb: 0.5, color: 'text.secondary' }}>{title}</Typography>
      {description && (
        <Typography variant="body2" sx={{ maxWidth: 360, mb: action ? 2 : 0 }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
