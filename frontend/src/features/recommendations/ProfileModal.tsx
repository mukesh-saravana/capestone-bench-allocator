import {
  Dialog, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, Tab, Tabs, Grid, LinearProgress, Chip, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState } from 'react';
import type { AllocationHistory, Recommendation } from '../../types';
import { AvailabilityBadge } from '../../components/common/Badges';
import { tokens } from '../../theme';

interface ProfileModalProps {
  recommendation: Recommendation;
  allocations: AllocationHistory[];
  onClose: () => void;
  onAssign: (r: Recommendation) => void;
}

const PROFICIENCY_LABELS = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const PROFICIENCY_COLORS = ['', tokens.colors.danger, tokens.colors.warning, tokens.colors.warning, tokens.colors.primary, tokens.colors.success];

export function ProfileModal({ recommendation: r, allocations, onClose, onAssign }: ProfileModalProps) {
  const [tab, setTab] = useState(0);
  const empAllocations = allocations.filter((a) => a.employeeId === r.employee.id);
  const ini = r.employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const scoreColor = r.score >= 9 ? tokens.colors.success : r.score >= 7 ? tokens.colors.primary : tokens.colors.warning;
  const scoreGradient = r.score >= 9 ? tokens.gradients.success : tokens.gradients.primary;
  const utilColor = r.employee.utilizationPct >= 80 ? tokens.colors.success : r.employee.utilizationPct >= 50 ? tokens.colors.warning : tokens.colors.danger;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { maxHeight: '88vh', overflow: 'hidden' } } }}>
      {/* Dark gradient header */}
      <Box sx={{
        p: 2.5, pt: 3,
        background: `linear-gradient(135deg, ${tokens.colors.sidebarBg} 0%, #1a3464 100%)`,
        position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `${tokens.colors.primary}20`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: `${tokens.colors.success}12`, pointerEvents: 'none' }} />

        {/* Close button */}
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(148,163,184,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, position: 'relative' }}>
          <Avatar sx={{
            width: 72, height: 72, background: tokens.gradients.primary,
            fontSize: '1.375rem', fontWeight: 700, flexShrink: 0,
            border: '3px solid rgba(255,255,255,0.18)',
            boxShadow: tokens.shadows.colored(tokens.colors.primary),
          }}>
            {ini}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff', letterSpacing: '-0.02em' }}>
                {r.employee.name}
              </Typography>
              {r.rank === 1 && (
                <Chip label="Best Match" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: `${tokens.colors.success}25`, color: tokens.colors.success, border: `1px solid ${tokens.colors.success}50` }} />
              )}
            </Box>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.85)', mt: 0.25, mb: 1 }}>
              {r.employee.role} · {r.employee.department} · {r.employee.experienceYears}yr exp
            </Typography>
            <AvailabilityBadge status={r.employee.availability} />
          </Box>

          {/* Score circle */}
          <Box sx={{ textAlign: 'center', flexShrink: 0, mr: 3 }}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '50%',
              background: scoreGradient,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.18)',
              boxShadow: tokens.shadows.colored(scoreColor),
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>
                {r.score.toFixed(1)}
              </Typography>
            </Box>
            <Typography sx={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.62rem', mt: 0.5, fontWeight: 600 }}>
              Match Score
            </Typography>
          </Box>
        </Box>

        {/* Stat row */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {[
            { label: 'Utilization', value: `${r.employee.utilizationPct}%`, color: utilColor },
            { label: 'Experience', value: `${r.employee.experienceYears} yrs`, color: tokens.colors.primaryLight },
            { label: 'Bench Since', value: r.employee.benchSince ?? 'N/A', color: 'rgba(148,163,184,0.8)' },
          ].map(({ label, value, color }) => (
            <Box key={label} sx={{ flex: 1, px: 1.5, py: 1, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.09)', textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.6)', mt: 0.25 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: `1px solid ${tokens.colors.border}`, flexShrink: 0,
          '& .MuiTab-root': { fontSize: '0.8rem', fontWeight: 600, minHeight: 44, textTransform: 'none' },
          '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', background: tokens.gradients.primary },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Skills" />
        <Tab label="History" />
        <Tab label="Rationale" />
      </Tabs>

      <DialogContent sx={{ p: 2.5, overflow: 'auto' }}>
        {/* ── Overview tab ── */}
        {tab === 0 && (
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: tokens.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>
              Skills Snapshot
            </Typography>
            {r.employee.skills.slice(0, 5).map(({ skill, proficiency }) => {
              const color = PROFICIENCY_COLORS[proficiency];
              return (
                <Box key={skill.id} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: tokens.colors.text }}>{skill.name}</Typography>
                    <Chip label={PROFICIENCY_LABELS[proficiency]} size="small"
                      sx={{ height: 17, fontSize: '0.6rem', fontWeight: 700, bgcolor: `${color}12`, color, border: `1px solid ${color}25` }} />
                  </Box>
                  <LinearProgress variant="determinate" value={proficiency * 20}
                    sx={{ height: 5, borderRadius: 3, bgcolor: `${color}12`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── Skills tab ── */}
        {tab === 1 && (
          <Box>
            {r.employee.skills.map(({ skill, proficiency }) => {
              const color = PROFICIENCY_COLORS[proficiency];
              return (
                <Box key={skill.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: tokens.colors.text }}>{skill.name}</Typography>
                      <Typography variant="body2">{skill.category}</Typography>
                    </Box>
                    <Chip label={PROFICIENCY_LABELS[proficiency]} size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: `${color}12`, color, border: `1px solid ${color}25` }} />
                  </Box>
                  <LinearProgress variant="determinate" value={proficiency * 20}
                    sx={{ height: 6, borderRadius: 3, bgcolor: `${color}12`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── History tab ── */}
        {tab === 2 && (
          <Box>
            {empAllocations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No allocation history found.</Typography>
            ) : (
              empAllocations.map((a) => (
                <Box key={a.id} sx={{
                  p: 2, mb: 1.5, borderRadius: 2,
                  bgcolor: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderLeft: `3px solid ${a.outcome === 'ongoing' ? tokens.colors.success : tokens.colors.primary}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: tokens.colors.text }}>{a.projectName}</Typography>
                    <Chip label={a.outcome} size="small" sx={{
                      height: 18, fontSize: '0.6rem', fontWeight: 700, textTransform: 'capitalize',
                      bgcolor: a.outcome === 'ongoing' ? `${tokens.colors.success}12` : `${tokens.colors.textTertiary}12`,
                      color: a.outcome === 'ongoing' ? tokens.colors.success : tokens.colors.textTertiary,
                    }} />
                  </Box>
                  <Typography variant="body2">{a.role}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.colors.textTertiary, mt: 0.5 }}>
                    {a.startDate}{a.endDate ? ` → ${a.endDate}` : ' · ongoing'}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        )}

        {/* ── Rationale tab ── */}
        {tab === 3 && (
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: tokens.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.25 }}>
              Why Recommended
            </Typography>
            <Box sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: `${tokens.colors.primary}06`, border: `1px solid ${tokens.colors.primary}20` }}>
              {r.reasons.map((reason, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: i < r.reasons.length - 1 ? 1 : 0, alignItems: 'flex-start' }}>
                  <CheckCircleOutlineIcon sx={{ color: tokens.colors.success, fontSize: 17, mt: '2px', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.875rem', color: tokens.colors.text }}>{reason}</Typography>
                </Box>
              ))}
              {r.employee.skills.some((s) => s.skill.name === 'Python' && s.proficiency < 4) && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'flex-start' }}>
                  <WarningAmberIcon sx={{ color: tokens.colors.warning, fontSize: 17, mt: '2px', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.875rem', color: tokens.colors.text }}>Limited Python proficiency</Typography>
                </Box>
              )}
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: tokens.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>
              Score Breakdown
            </Typography>
            {[
              { label: 'Skill Match',        value: r.scoreBreakdown.skillMatch,        color: tokens.colors.primary },
              { label: 'Project Experience', value: r.scoreBreakdown.projectExperience, color: tokens.colors.success },
              { label: 'Availability',       value: r.scoreBreakdown.availability,      color: tokens.colors.warning },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: tokens.colors.text }}>{label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color }}>{value} / 10</Typography>
                </Box>
                <LinearProgress variant="determinate" value={value * 10}
                  sx={{ height: 8, borderRadius: 4, bgcolor: `${color}12`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, borderTop: `1px solid ${tokens.colors.border}`, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
        <Button onClick={() => onAssign(r)} variant="contained" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2 }}>
          Assign Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
