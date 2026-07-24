import { Grid, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, Tooltip as ReTooltip } from 'recharts';
import { MetricCard } from '../../components/common/MetricCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { PriorityBadge } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonCard';
import {
  MOCK_BENCH_METRICS, MOCK_UTILIZATION_METRICS,
  MOCK_PROJECT_NEEDS, MOCK_ALLOCATIONS,
} from '../../lib/mockData';
import { tokens } from '../../theme';

// Simulating loading=false for now; swap to useQuery when backend is ready
const loading = false;

export function DashboardPage() {
  return (
    <Box>
      <Grid container spacing={2.5}>
        {/* Row 1: Metric Cards */}
        <Grid size={{ xs: 12, sm: 6 }}>
          {loading ? (
            <SkeletonCard height={160} />
          ) : (
            <MetricCard
              title="Bench Status"
              value={MOCK_BENCH_METRICS.totalOnBench}
              subtitle="Engineers currently on bench"
              accent="success"
            >
              <Box sx={{ mt: 1.5, height: 40 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_BENCH_METRICS.trend}>
                    <Line type="monotone" dataKey="count" stroke={tokens.colors.success} strokeWidth={2} dot={false} />
                    <ReTooltip />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </MetricCard>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {loading ? (
            <SkeletonCard height={160} />
          ) : (
            <MetricCard
              title="Average Utilization"
              value={`${MOCK_UTILIZATION_METRICS.averagePct}%`}
              subtitle="Team utilization rate"
              accent={MOCK_UTILIZATION_METRICS.averagePct >= 80 ? 'success' : 'warning'}
            >
              <Box sx={{ mt: 1.5 }}>
                <ProgressBar value={MOCK_UTILIZATION_METRICS.averagePct} showLabel />
              </Box>
            </MetricCard>
          )}
        </Grid>

        {/* Row 2: Active Projects Table */}
        <Grid size={12}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>Active Projects with Open Needs</Typography>
            {loading ? (
              <SkeletonTable rows={4} />
            ) : MOCK_PROJECT_NEEDS.length === 0 ? (
              <EmptyState title="No open project needs at this time." />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: tokens.colors.neutralDark, fontWeight: 600, fontSize: '0.8rem' } }}>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Skills Required</TableCell>
                    <TableCell align="center">Open Slots</TableCell>
                    <TableCell>Priority</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_PROJECT_NEEDS.map((need, i) => (
                    <TableRow
                      key={need.id}
                      sx={{
                        bgcolor: i % 2 === 0 ? '#fff' : tokens.colors.background,
                        '&:hover': { bgcolor: '#E3F2FD' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{need.projectName}</TableCell>
                      <TableCell>{need.roleTitle}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {need.requiredSkills.map((s) => (
                            <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{need.openSlots}</TableCell>
                      <TableCell><PriorityBadge priority={need.priority} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        {/* Row 3: Recent Allocations */}
        <Grid size={12}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>Recent Allocations</Typography>
            {loading ? (
              <SkeletonTable rows={4} />
            ) : MOCK_ALLOCATIONS.length === 0 ? (
              <EmptyState
                title="No allocations yet."
                description="Upload data to get started."
              />
            ) : (
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {MOCK_ALLOCATIONS.slice(0, 6).map((a) => (
                  <Box
                    component="li"
                    key={a.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5,
                      borderBottom: `1px solid ${tokens.colors.border}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: tokens.colors.primary, flexShrink: 0 }} />
                    <Typography variant="body1" sx={{ flex: 1 }}>
                      <strong>{a.employeeName}</strong> → {a.projectName}
                    </Typography>
                    <Typography variant="body2">{a.startDate}</Typography>
                    <Chip
                      label={a.outcome === 'ongoing' ? 'Allocated' : 'Completed'}
                      size="small"
                      sx={{
                        bgcolor: a.outcome === 'ongoing' ? tokens.colors.success : tokens.colors.neutral,
                        color: a.outcome === 'ongoing' ? '#fff' : tokens.colors.textSecondary,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
