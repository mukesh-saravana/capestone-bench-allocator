import { Box, Skeleton } from '@mui/material';

interface SkeletonCardProps {
  height?: number;
  rows?: number;
}

export function SkeletonCard({ height = 120, rows = 1 }: SkeletonCardProps) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={height / rows} sx={{ borderRadius: 1, mb: i < rows - 1 ? 1 : 0 }} />
      ))}
    </Box>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 0 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 0, mt: '1px' }} />
      ))}
    </Box>
  );
}
