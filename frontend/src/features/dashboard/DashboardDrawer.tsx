import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Chip, Button, LinearProgress, Divider,
} from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip,
} from 'recharts';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { AvailabilityBadge, PriorityBadge } from '../../components/common/Badges';
import { tokens } from '../../theme';
import type { AllocationHistory, AllocationsSummary, BenchMetrics, Employee, ProjectNeed, UtilizationMetrics } from '../../types';

// ── Types ────────────────────────────────────────────────────────────────────

export type DashboardPanel =
  | { kind: 'bench' }
  | { kind: 'utilization' }
  | { kind: 'roles' }
  | { kind: 'allocations' }
  | { kind: 'employee'; employee: Employee }
  | { kind: 'project'; need: ProjectNeed }
  | { kind: 'dept'; department: string };

interface DrawerData {
  employees: Employee[];
  projectNeeds: ProjectNeed[];
  allocationHistory: AllocationHistory[];
  utilizationMetrics: UtilizationMetrics | undefined;
  benchMetrics: BenchMetrics | undefined;
  allocationsSummary: AllocationsSummary | undefined;
}

interface DashboardDrawerProps extends DrawerData {
  panel: DashboardPanel | null;
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2);
}

const PROFICIENCY_LABELS = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const PROFICIENCY_COLORS = ['', tokens.colors.danger, tokens.colors.warning, tokens.colors.warning, tokens.colors.primary, tokens.colors.success];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: tokens.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.25 }}>
      {children}
    </Typography>
  );
}

function StatBox({ label, value, color = tokens.colors.primary, gradient }: { label: string; value: string; color?: string; gradient?: string }) {
  return (
    <Box sx={{
      flex: 1, p: 1.5, borderRadius: 2, textAlign: 'center',
      background: gradient ?? `${color}10`,
      border: `1px solid ${color}20`,
    }}>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.68rem', color: tokens.colors.textTertiary, mt: 0.25, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: tokens.colors.sidebarBg, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1.5, px: 1.5, py: 1, boxShadow: tokens.shadows.md }}>
      {label && <Typography sx={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.7rem', mb: 0.25 }}>{label}</Typography>}
      <Typography sx={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>{payload[0].value}%</Typography>
    </Box>
  );
}

function ClickableRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 150ms ease',
        '&:hover': onClick ? { bgcolor: tokens.colors.neutral } : {},
        '&:active': onClick ? { bgcolor: tokens.colors.neutralDark } : {},
      }}
    >
      {children}
    </Box>
  );
}

// ── Panel: Employee Profile ───────────────────────────────────────────────────

function EmployeePanel({ employee: emp, allocationHistory }: { employee: Employee; allocationHistory: AllocationHistory[] }) {
  const navigate = useNavigate();
  const history = allocationHistory.filter((a) => a.employeeId === emp.id);
  const utilizationColor = emp.utilizationPct >= 80 ? tokens.colors.success : emp.utilizationPct >= 50 ? tokens.colors.warning : tokens.colors.danger;

  return (
    <Box>
      {/* Hero */}
      <Box sx={{
        p: 3,
        background: `linear-gradient(135deg, ${tokens.colors.sidebarBg} 0%, #1a3464 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', bottom: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${tokens.colors.success}15`, pointerEvents: 'none' }} />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{
            width: 68, height: 68, background: tokens.gradients.primary,
            fontSize: '1.25rem', fontWeight: 700, flexShrink: 0,
            border: '3px solid rgba(255,255,255,0.15)',
            boxShadow: tokens.shadows.colored(tokens.colors.primary),
          }}>
            {initials(emp.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff', lineHeight: 1.2, mb: 0.25 }}>{emp.name}</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.85)', mb: 1 }}>{emp.role} · {emp.department}</Typography>
            <AvailabilityBadge status={emp.availability} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, mt: 2.5 }}>
          <StatBox label="Utilization" value={`${emp.utilizationPct}%`} color={utilizationColor} />
          <StatBox label="Experience" value={`${emp.experienceYears}yr`} color={tokens.colors.primary} />
          <StatBox label="Bench Since" value={emp.benchSince ?? '—'} color={tokens.colors.textTertiary} />
        </Box>
      </Box>

      {/* Utilization bar */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <SectionLabel>Utilization</SectionLabel>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: utilizationColor }}>{emp.utilizationPct}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate" value={emp.utilizationPct}
          sx={{
            height: 8, borderRadius: 4, bgcolor: `${utilizationColor}15`,
            '& .MuiLinearProgress-bar': { bgcolor: utilizationColor, borderRadius: 4 },
          }}
        />
      </Box>

      {/* Skills */}
      <Box sx={{ px: 2.5, pt: 2.5 }}>
        <SectionLabel>Skills & Proficiency</SectionLabel>
        {emp.skills.length === 0 ? (
          <Typography variant="body2">No skills recorded.</Typography>
        ) : (
          emp.skills.map(({ skill, proficiency }) => {
            const color = PROFICIENCY_COLORS[proficiency];
            return (
              <Box key={skill.id} sx={{ mb: 1.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: tokens.colors.text }}>{skill.name}</Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: tokens.colors.textTertiary }}>{skill.category}</Typography>
                  </Box>
                  <Chip label={PROFICIENCY_LABELS[proficiency]} size="small"
                    sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: `${color}15`, color, border: `1px solid ${color}30` }} />
                </Box>
                <LinearProgress
                  variant="determinate" value={proficiency * 20}
                  sx={{ height: 5, borderRadius: 3, bgcolor: `${color}12`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
                />
              </Box>
            );
          })
        )}
      </Box>

      {/* Allocation History */}
      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <SectionLabel>Allocation History</SectionLabel>
        {history.length === 0 ? (
          <Typography variant="body2">No allocation history found.</Typography>
        ) : (
          history.map((a) => (
            <Box key={a.id} sx={{
              p: 1.5, mb: 1.25, borderRadius: 2,
              bgcolor: tokens.colors.surface,
              border: `1px solid ${tokens.colors.border}`,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: tokens.colors.text }}>{a.projectName}</Typography>
                <Chip
                  label={a.outcome}
                  size="small"
                  sx={{
                    height: 18, fontSize: '0.6rem', fontWeight: 700, textTransform: 'capitalize',
                    bgcolor: a.outcome === 'ongoing' ? `${tokens.colors.success}15` : `${tokens.colors.textTertiary}15`,
                    color: a.outcome === 'ongoing' ? tokens.colors.success : tokens.colors.textTertiary,
                    border: `1px solid ${a.outcome === 'ongoing' ? tokens.colors.success : tokens.colors.textTertiary}30`,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 0.25 }}>{a.role}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.textTertiary, mt: 0.5 }}>
                {a.startDate}{a.endDate ? ` → ${a.endDate}` : ' · ongoing'}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      <Box sx={{ px: 2.5, pb: 3 }}>
        <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/recommendations')}
          sx={{ borderRadius: 2 }}>
          Find Similar Candidates
        </Button>
      </Box>
    </Box>
  );
}

// ── Panel: Project Need ───────────────────────────────────────────────────────

function ProjectPanel({ need }: { need: ProjectNeed }) {
  const navigate = useNavigate();
  const priorityColors: Record<string, string> = {
    high: tokens.colors.danger, medium: tokens.colors.warning, low: tokens.colors.success,
  };
  const color = priorityColors[need.priority] ?? tokens.colors.primary;

  return (
    <Box>
      {/* Hero */}
      <Box sx={{
        p: 3,
        background: `linear-gradient(135deg, #0F172A 0%, #1a3464 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${color}20`, pointerEvents: 'none' }} />
        <Box sx={{
          width: 52, height: 52, borderRadius: 2, mb: 2, flexShrink: 0,
          background: `${color}25`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontWeight: 800, fontSize: '1.25rem',
        }}>
          {need.projectName.charAt(0)}
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff', lineHeight: 1.2, mb: 0.5 }}>{need.projectName}</Typography>
        <Typography sx={{ fontSize: '0.875rem', color: 'rgba(148,163,184,0.85)', mb: 1.5 }}>{need.roleTitle}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <PriorityBadge priority={need.priority} />
          <Chip label={need.status} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, textTransform: 'capitalize', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, mt: 2.5 }}>
          <StatBox label="Open Slots" value={String(need.openSlots)} color={color} />
          <StatBox label="Start Date" value={need.startDate ?? 'TBD'} color={tokens.colors.primary} />
        </Box>
      </Box>

      {/* Required Skills */}
      <Box sx={{ px: 2.5, pt: 2.5 }}>
        <SectionLabel>Required Skills</SectionLabel>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {need.requiredSkills.map((s) => (
            <Chip key={s} label={s} size="small" sx={{
              bgcolor: `${tokens.colors.primary}10`, color: tokens.colors.primary,
              border: `1px solid ${tokens.colors.primary}25`, fontWeight: 500, fontSize: '0.75rem',
            }} />
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pt: 3, pb: 3 }}>
        <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/recommendations')}
          sx={{ borderRadius: 2 }}>
          Find Candidates for This Role
        </Button>
      </Box>
    </Box>
  );
}

// ── Panel: Department Employees ───────────────────────────────────────────────

function DeptPanel({ department, employees, utilizationMetrics, onNavigate }: {
  department: string;
  employees: Employee[];
  utilizationMetrics: UtilizationMetrics | undefined;
  onNavigate: (p: DashboardPanel) => void;
}) {
  const deptEmployees = employees.filter((e) => e.department === department);
  const avgUtil = deptEmployees.length
    ? Math.round(deptEmployees.reduce((s, e) => s + e.utilizationPct, 0) / deptEmployees.length)
    : 0;
  const benchCount = deptEmployees.filter((e) => e.availability === 'available').length;
  const deptPct = utilizationMetrics?.byDepartment.find((d) => d.department === department)?.pct ?? avgUtil;

  const utilColor = deptPct >= 80 ? tokens.colors.success : tokens.colors.warning;

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ p: 3, background: `linear-gradient(135deg, #0F172A 0%, #1a3464 100%)`, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: `${utilColor}15`, pointerEvents: 'none' }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>Department</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.375rem', color: '#fff', letterSpacing: '-0.02em', mb: 2 }}>{department}</Typography>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <StatBox label="Utilization" value={`${deptPct}%`} color={utilColor} />
          <StatBox label="Total" value={String(deptEmployees.length)} color={tokens.colors.primary} />
          <StatBox label="On Bench" value={String(benchCount)} color={tokens.colors.success} />
        </Box>
      </Box>

      {/* Utilization bar */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <LinearProgress
          variant="determinate" value={deptPct}
          sx={{ height: 10, borderRadius: 5, bgcolor: `${utilColor}15`, '& .MuiLinearProgress-bar': { bgcolor: utilColor, borderRadius: 5 } }}
        />
      </Box>

      <Divider sx={{ mx: 2.5, my: 1.5 }} />

      <Box sx={{ px: 2.5, pb: 1 }}><SectionLabel>Team Members — click to view profile</SectionLabel></Box>

      {deptEmployees.map((emp) => {
        const eColor = emp.utilizationPct >= 80 ? tokens.colors.success : tokens.colors.warning;
        return (
          <ClickableRow key={emp.id} onClick={() => onNavigate({ kind: 'employee', employee: emp })}>
            <Avatar sx={{ width: 36, height: 36, background: tokens.gradients.primary, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
              {initials(emp.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: tokens.colors.text }}>{emp.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <LinearProgress variant="determinate" value={emp.utilizationPct}
                  sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: `${eColor}15`, '& .MuiLinearProgress-bar': { bgcolor: eColor, borderRadius: 2 } }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: eColor, minWidth: 30 }}>{emp.utilizationPct}%</Typography>
              </Box>
            </Box>
            <AvailabilityBadge status={emp.availability} />
          </ClickableRow>
        );
      })}
      <Box sx={{ pb: 2 }} />
    </Box>
  );
}

// ── Panel: On Bench Metric ────────────────────────────────────────────────────

function BenchPanel({ employees, onNavigate }: { employees: Employee[]; onNavigate: (p: DashboardPanel) => void }) {
  const benchEmployees = employees.filter((e) => e.availability === 'available');

  return (
    <Box>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.colors.border}`, bgcolor: tokens.colors.surface }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: tokens.colors.primary, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {benchEmployees.length}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.25 }}>Engineers currently available</Typography>
      </Box>
      <Box sx={{ px: 2.5, py: 2, pb: 1 }}><SectionLabel>Click any row to view full profile</SectionLabel></Box>
      {benchEmployees.map((emp) => (
        <ClickableRow key={emp.id} onClick={() => onNavigate({ kind: 'employee', employee: emp })}>
          <Avatar sx={{ width: 40, height: 40, background: tokens.gradients.success, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
            {initials(emp.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: tokens.colors.text }}>{emp.name}</Typography>
            <Typography variant="body2">{emp.role} · {emp.department}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            {emp.benchSince && (
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.textTertiary }}>{emp.benchSince}</Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 0.25 }}>
              {emp.skills.slice(0, 2).map(({ skill }) => (
                <Chip key={skill.id} label={skill.name} size="small"
                  sx={{ fontSize: '0.6rem', height: 18, bgcolor: `${tokens.colors.success}12`, color: tokens.colors.success, border: `1px solid ${tokens.colors.success}25` }} />
              ))}
            </Box>
          </Box>
        </ClickableRow>
      ))}
      <Box sx={{ pb: 2 }} />
    </Box>
  );
}

// ── Panel: Utilization Metric ─────────────────────────────────────────────────

function UtilizationPanel({ utilizationMetrics, employees, onNavigate }: {
  utilizationMetrics: UtilizationMetrics | undefined;
  employees: Employee[];
  onNavigate: (p: DashboardPanel) => void;
}) {
  const depts = utilizationMetrics?.byDepartment ?? [];
  const avg = utilizationMetrics?.averagePct ?? 0;
  const avgColor = avg >= 80 ? tokens.colors.success : tokens.colors.warning;

  return (
    <Box>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.colors.border}`, bgcolor: tokens.colors.surface }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: avgColor, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {avg}%
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.25 }}>Average team utilization</Typography>
      </Box>

      {depts.length > 0 && (
        <Box sx={{ px: 2.5, pt: 2.5 }}>
          <SectionLabel>By Department — click bar to explore team</SectionLabel>
          <Box sx={{ height: depts.length * 48 + 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depts} layout="vertical" margin={{ left: 0, right: 32, top: 4, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category" dataKey="department" width={80}
                  tick={{ fontSize: 12, fill: tokens.colors.textSecondary }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: `${tokens.colors.primary}08` }} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} cursor="pointer"
                  onClick={(d: { department: string }) => onNavigate({ kind: 'dept', department: d.department })}>
                  {depts.map((entry) => (
                    <Cell key={entry.department} fill={entry.pct >= 80 ? tokens.colors.success : tokens.colors.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}

      <Divider sx={{ mx: 2.5, my: 2 }} />

      <Box sx={{ px: 2.5, pb: 1 }}><SectionLabel>All employees · sorted by utilization</SectionLabel></Box>
      {[...employees].sort((a, b) => b.utilizationPct - a.utilizationPct).map((emp) => {
        const ec = emp.utilizationPct >= 80 ? tokens.colors.success : tokens.colors.warning;
        return (
          <ClickableRow key={emp.id} onClick={() => onNavigate({ kind: 'employee', employee: emp })}>
            <Avatar sx={{ width: 36, height: 36, background: tokens.gradients.primary, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
              {initials(emp.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: tokens.colors.text }}>{emp.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <LinearProgress variant="determinate" value={emp.utilizationPct}
                  sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: `${ec}15`, '& .MuiLinearProgress-bar': { bgcolor: ec, borderRadius: 2 } }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ec, minWidth: 30 }}>{emp.utilizationPct}%</Typography>
              </Box>
            </Box>
            <AvailabilityBadge status={emp.availability} />
          </ClickableRow>
        );
      })}
      <Box sx={{ pb: 2 }} />
    </Box>
  );
}

// ── Panel: Open Roles Metric ──────────────────────────────────────────────────

function RolesPanel({ projectNeeds, onNavigate }: { projectNeeds: ProjectNeed[]; onNavigate: (p: DashboardPanel) => void }) {
  const openNeeds = projectNeeds.filter((n) => n.status === 'open');

  return (
    <Box>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.colors.border}`, bgcolor: tokens.colors.surface }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: tokens.colors.danger, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {openNeeds.reduce((s, n) => s + n.openSlots, 0)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.25 }}>Open slots across {openNeeds.length} project need{openNeeds.length !== 1 ? 's' : ''}</Typography>
      </Box>

      <Box sx={{ px: 2.5, py: 2, pb: 1 }}><SectionLabel>Click a project to view details</SectionLabel></Box>

      {openNeeds.map((need, i) => {
        const colors = [tokens.colors.primary, tokens.colors.success, tokens.colors.warning, tokens.colors.danger];
        const c = colors[i % colors.length];
        return (
          <ClickableRow key={need.id} onClick={() => onNavigate({ kind: 'project', need })}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, flexShrink: 0, background: `${c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c, fontWeight: 800, fontSize: '1rem' }}>
              {need.projectName.charAt(0)}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: tokens.colors.text }}>{need.projectName}</Typography>
              <Typography variant="body2">{need.roleTitle}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: c, lineHeight: 1 }}>{need.openSlots}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.textTertiary }}>slots</Typography>
            </Box>
            <PriorityBadge priority={need.priority} />
          </ClickableRow>
        );
      })}
      <Box sx={{ pb: 2 }} />
    </Box>
  );
}

// ── Panel: Active Allocations Metric ──────────────────────────────────────────

function AllocationsPanel({ allocationsSummary, employees, onNavigate }: {
  allocationsSummary: AllocationsSummary | undefined;
  employees: Employee[];
  onNavigate: (p: DashboardPanel) => void;
}) {
  const recent = allocationsSummary?.recent ?? [];

  return (
    <Box>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.colors.border}`, bgcolor: tokens.colors.surface }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: tokens.colors.success, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {allocationsSummary?.activeAllocations ?? '—'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.25 }}>Active allocations this month</Typography>
      </Box>

      {recent.length > 0 && (
        <>
          <Box sx={{ px: 2.5, py: 2, pb: 1 }}><SectionLabel>Recent activity · click to view employee profile</SectionLabel></Box>
          {recent.map((a) => {
            const emp = employees.find((e) => e.id === a.employeeId);
            return (
              <ClickableRow key={a.id} onClick={() => emp && onNavigate({ kind: 'employee', employee: emp })}>
                <Avatar sx={{ width: 38, height: 38, background: tokens.gradients.primary, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                  {initials(a.employeeName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: tokens.colors.text }}>{a.employeeName}</Typography>
                  <Typography variant="body2">→ {a.projectName} · {a.role}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="body2">{a.startDate}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mt: 0.25 }}>
                    {a.outcome === 'ongoing'
                      ? <RadioButtonUncheckedIcon sx={{ fontSize: 10, color: tokens.colors.success }} />
                      : <CheckCircleOutlineIcon sx={{ fontSize: 10, color: tokens.colors.textTertiary }} />}
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: a.outcome === 'ongoing' ? tokens.colors.success : tokens.colors.textTertiary, textTransform: 'capitalize' }}>
                      {a.outcome}
                    </Typography>
                  </Box>
                </Box>
              </ClickableRow>
            );
          })}
        </>
      )}
      <Box sx={{ pb: 2 }} />
    </Box>
  );
}

// ── Main DashboardDrawer ──────────────────────────────────────────────────────

const panelMeta: Record<DashboardPanel['kind'], { icon: React.ReactNode; titleFn: (p: DashboardPanel) => string; subtitleFn?: (p: DashboardPanel) => string }> = {
  bench:       { icon: <GroupsOutlinedIcon sx={{ fontSize: 18 }} />, titleFn: () => 'On Bench',           subtitleFn: () => 'Engineers available for allocation' },
  utilization: { icon: <SpeedOutlinedIcon sx={{ fontSize: 18 }} />, titleFn: () => 'Utilization',         subtitleFn: () => 'Click a department to see its team' },
  roles:       { icon: <WorkOutlineIcon sx={{ fontSize: 18 }} />,   titleFn: () => 'Open Roles',          subtitleFn: () => 'Click a project to view details' },
  allocations: { icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,    titleFn: () => 'Active Allocations',  subtitleFn: () => 'Click any row to view employee' },
  employee:    { icon: <PersonOutlineIcon sx={{ fontSize: 18 }} />, titleFn: (p) => (p as { kind: 'employee'; employee: Employee }).employee.name },
  project:     { icon: <WorkOutlineIcon sx={{ fontSize: 18 }} />,   titleFn: (p) => (p as { kind: 'project'; need: ProjectNeed }).need.projectName },
  dept:        { icon: <GroupsOutlinedIcon sx={{ fontSize: 18 }} />, titleFn: (p) => (p as { kind: 'dept'; department: string }).department, subtitleFn: () => 'Department overview' },
};

export function DashboardDrawer({ panel, onClose, employees, projectNeeds, allocationHistory, utilizationMetrics, benchMetrics, allocationsSummary }: DashboardDrawerProps) {
  const [stack, setStack] = useState<DashboardPanel[]>([]);

  useEffect(() => {
    setStack(panel ? [panel] : []);
  }, [panel]);

  const open = stack.length > 0;
  const current = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  function navigate(p: DashboardPanel) { setStack((prev) => [...prev, p]); }
  function back() { setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : [])); if (stack.length <= 1) onClose(); }

  const meta = current ? panelMeta[current.kind] : null;
  const title = meta && current ? meta.titleFn(current) : '';
  const subtitle = meta && current ? meta.subtitleFn?.(current) : undefined;

  return (
    <DetailDrawer
      open={open}
      onClose={onClose}
      onBack={canGoBack ? back : undefined}
      title={title}
      subtitle={subtitle}
      icon={!canGoBack ? meta?.icon : undefined}
    >
      {current?.kind === 'employee' && (
        <EmployeePanel employee={current.employee} allocationHistory={allocationHistory} />
      )}
      {current?.kind === 'project' && (
        <ProjectPanel need={current.need} />
      )}
      {current?.kind === 'dept' && (
        <DeptPanel department={current.department} employees={employees} utilizationMetrics={utilizationMetrics} onNavigate={navigate} />
      )}
      {current?.kind === 'bench' && (
        <BenchPanel employees={employees} onNavigate={navigate} />
      )}
      {current?.kind === 'utilization' && (
        <UtilizationPanel utilizationMetrics={utilizationMetrics} employees={employees} onNavigate={navigate} />
      )}
      {current?.kind === 'roles' && (
        <RolesPanel projectNeeds={projectNeeds} onNavigate={navigate} />
      )}
      {current?.kind === 'allocations' && (
        <AllocationsPanel allocationsSummary={allocationsSummary} employees={employees} onNavigate={navigate} />
      )}
      {/* suppress lint: benchMetrics is kept for future panels */}
      {benchMetrics && false && null}
      <CalendarTodayOutlinedIcon sx={{ display: 'none' }} />
    </DetailDrawer>
  );
}
