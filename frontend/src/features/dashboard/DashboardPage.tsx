import { Grid, Box, Typography, Paper, Chip, Avatar } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, Tooltip as ReTooltip } from 'recharts';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { MetricCard } from '../../components/common/MetricCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { PriorityBadge } from '../../components/common/Badges';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonCard';
import {
  MOCK_BENCH_METRICS, MOCK_UTILIZATION_METRICS,
  MOCK_PROJECT_NEEDS, MOCK_ALLOCATIONS, MOCK_EMPLOYEES,
} from '../../lib/mockData';
import { tokens } from '../../theme';

const loading = false;

export function DashboardPage() {
  const benchCount = MOCK_BENCH_METRICS.totalOnBench;
  const utilPct = MOCK_UTILIZATION_METRICS.averagePct;
  const openRoles = MOCK_PROJECT_NEEDS.filter((n) => n.status === 'open').reduce((s, n) => s + n.openSlots, 0);
  const allocatedThisMonth = MOCK_ALLOCATIONS.filter((a) => a.outcome === 'ongoing').length;

  return (
    <Box>
      {/* ── Row 1: 4 summary cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? <SkeletonCard height={140} /> : (
            <MetricCard
              title="On Bench"
              value={benchCount}
              subtitle="Engineers available"
              accent="primary"
              icon={<GroupsOutlinedIcon sx={{ fontSize: 20 }} />}
              trend={{ value: -2, label: 'vs last wk' }}
            >
              <Box sx={{ height: 36 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_BENCH_METRICS.trend}>
                    <Line type="monotone" dataKey="count" stroke={tokens.colors.primary} strokeWidth={2} dot={false} />
                    <ReTooltip contentStyle={{ fontSize: 11 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </MetricCard>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? <SkeletonCard height={140} /> : (
            <MetricCard
              title="Utilization"
              value={`${utilPct}%`}
              subtitle="Team average"
              accent={utilPct >= 80 ? 'success' : 'warning'}
              icon={<SpeedOutlinedIcon sx={{ fontSize: 20 }} />}
              trend={{ value: 3, label: 'vs last wk' }}
            >
              <Box sx={{ mt: 1 }}>
                <ProgressBar value={utilPct} showLabel height={6} />
              </Box>
            </MetricCard>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? <SkeletonCard height={140} /> : (
            <MetricCard
              title="Open Roles"
              value={openRoles}
              subtitle="Across all projects"
              accent="danger"
              icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />}
              trend={{ value: 1, label: 'new today' }}
            >
              <Box sx={{ height: 36 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_BENCH_METRICS.trend}>
                    <Area type="monotone" dataKey="count" stroke={tokens.colors.danger} fill={`${tokens.colors.danger}15`} strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </MetricCard>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {loading ? <SkeletonCard height={140} /> : (
            <MetricCard
              title="Active Allocations"
              value={allocatedThisMonth}
              subtitle="Ongoing this month"
              accent="success"
              icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
              trend={{ value: 12, label: 'vs last mo' }}
            />
          )}
        </Grid>
      </Grid>

      {/* ── Row 2: Projects table + Utilization by dept ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: tokens.colors.text }}>Active Projects</Typography>
                <Typography variant="body2">Open staffing needs</Typography>
              </Box>
              <Chip label={`${MOCK_PROJECT_NEEDS.length} open`} size="small"
                sx={{ bgcolor: `${tokens.colors.primary}12`, color: tokens.colors.primary, fontWeight: 600, border: `1px solid ${tokens.colors.primary}25` }} />
            </Box>
            {loading ? <SkeletonTable rows={4} /> : MOCK_PROJECT_NEEDS.length === 0 ? (
              <EmptyState title="No open project needs at this time." sx={{ py: 4 }} />
            ) : (
              <Box>
                {MOCK_PROJECT_NEEDS.map((need, i) => (
                  <Box key={need.id} sx={{
                    px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 2,
                    borderBottom: i < MOCK_PROJECT_NEEDS.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                    transition: 'background 150ms ease',
                    '&:hover': { bgcolor: tokens.colors.neutral },
                  }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                      background: [`${tokens.colors.primary}20`, `${tokens.colors.success}20`, `${tokens.colors.warning}20`][i % 3],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: [tokens.colors.primary, tokens.colors.success, tokens.colors.warning][i % 3],
                      fontWeight: 700, fontSize: '0.875rem',
                    }}>
                      {need.projectName.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: tokens.colors.text, mb: 0.25 }}>{need.projectName}</Typography>
                      <Typography variant="body2">{need.roleTitle}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 200, justifyContent: 'flex-end' }}>
                      {need.requiredSkills.slice(0, 3).map((s) => (
                        <Chip key={s} label={s} size="small"
                          sx={{ fontSize: '0.68rem', height: 20, bgcolor: `${tokens.colors.primary}10`, color: tokens.colors.primary, border: `1px solid ${tokens.colors.primary}20` }} />
                      ))}
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 48 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: tokens.colors.text, lineHeight: 1 }}>{need.openSlots}</Typography>
                      <Typography variant="body2">slots</Typography>
                    </Box>
                    <PriorityBadge priority={need.priority} />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Utilization by department */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ height: '100%' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: tokens.colors.text }}>Utilization by Dept</Typography>
              <Typography variant="body2">Current allocation rates</Typography>
            </Box>
            <Box sx={{ p: 2.5 }}>
              {MOCK_UTILIZATION_METRICS.byDepartment.map(({ department, pct }) => (
                <Box key={department} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: tokens.colors.text }}>{department}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: pct >= 80 ? tokens.colors.success : tokens.colors.warning }}>
                      {pct}%
                    </Typography>
                  </Box>
                  <ProgressBar value={pct} height={8} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Recent Allocations + Bench list ── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper>
            <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: tokens.colors.text }}>Recent Allocations</Typography>
              <Typography variant="body2">Staffing activity feed</Typography>
            </Box>
            {loading ? <SkeletonTable rows={4} /> : MOCK_ALLOCATIONS.length === 0 ? (
              <EmptyState title="No allocations yet." description="Upload data to get started." sx={{ py: 4 }} />
            ) : (
              <Box sx={{ p: 0.5 }}>
                {MOCK_ALLOCATIONS.slice(0, 6).map((a) => (
                  <Box key={a.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5,
                    borderRadius: 2, transition: 'background 150ms ease', '&:hover': { bgcolor: tokens.colors.neutral },
                  }}>
                    <Avatar sx={{ width: 36, height: 36, background: tokens.gradients.primary, fontSize: '0.8rem', fontWeight: 700 }}>
                      {a.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: tokens.colors.text }}>
                        {a.employeeName}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>→</span> {a.projectName} · {a.role}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="body2">{a.startDate}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mt: 0.25 }}>
                        {a.outcome === 'ongoing'
                          ? <RadioButtonUncheckedIcon sx={{ fontSize: 10, color: tokens.colors.success }} />
                          : <CheckCircleOutlinedIcon sx={{ fontSize: 10, color: tokens.colors.textTertiary }} />}
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: a.outcome === 'ongoing' ? tokens.colors.success : tokens.colors.textTertiary, textTransform: 'capitalize' }}>
                          {a.outcome}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Engineers on bench */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper>
            <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: tokens.colors.text }}>On Bench</Typography>
                <Typography variant="body2">Available for allocation</Typography>
              </Box>
              <Chip label={`${benchCount} available`} size="small"
                sx={{ bgcolor: `${tokens.colors.success}12`, color: tokens.colors.success, fontWeight: 600, border: `1px solid ${tokens.colors.success}25` }} />
            </Box>
            <Box sx={{ p: 0.5 }}>
              {MOCK_EMPLOYEES.filter((e) => e.availability === 'available').map((emp) => (
                <Box key={emp.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25,
                  borderRadius: 2, transition: 'background 150ms ease', '&:hover': { bgcolor: tokens.colors.neutral },
                }}>
                  <Avatar sx={{ width: 32, height: 32, background: tokens.gradients.success, fontSize: '0.75rem', fontWeight: 700 }}>
                    {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: tokens.colors.text }}>{emp.name}</Typography>
                    <Typography variant="body2">{emp.role} · {emp.department}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.textTertiary }}>
                      {emp.benchSince ? `Since ${emp.benchSince}` : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 0.25 }}>
                      {emp.skills.slice(0, 2).map(({ skill }) => (
                        <Chip key={skill.id} label={skill.name} size="small"
                          sx={{ fontSize: '0.6rem', height: 18, bgcolor: `${tokens.colors.success}12`, color: tokens.colors.success, border: `1px solid ${tokens.colors.success}25` }} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
