import {
  Dialog, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, Tab, Tabs, Grid, Paper, Divider,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useState } from 'react';
import type { Recommendation } from '../../types';
import { AvailabilityBadge } from '../../components/common/Badges';
import { MOCK_ALLOCATIONS } from '../../lib/mockData';
import { tokens } from '../../theme';

interface ProfileModalProps {
  recommendation: Recommendation;
  onClose: () => void;
  onAssign: (r: Recommendation) => void;
}

function StarRating({ value }: { value: number }) {
  return (
    <Box sx={{ display: 'flex' }}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= value
          ? <StarIcon key={i} sx={{ fontSize: 16, color: tokens.colors.warning }} />
          : <StarBorderIcon key={i} sx={{ fontSize: 16, color: tokens.colors.border }} />
      )}
    </Box>
  );
}

export function ProfileModal({ recommendation: r, onClose, onAssign }: ProfileModalProps) {
  const [tab, setTab] = useState(0);
  const empAllocations = MOCK_ALLOCATIONS.filter((a) => a.employeeId === r.employee.id);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { maxHeight: '85vh' } } }}>
      {/* Header */}
      <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', borderBottom: `1px solid ${tokens.colors.border}` }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: tokens.colors.primary, fontSize: '1.5rem' }}>
          {r.employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h2">{r.employee.name}</Typography>
          <Typography variant="body1">{r.employee.role} · {r.employee.department}</Typography>
          <Box sx={{ mt: 0.5 }}><AvailabilityBadge status={r.employee.availability} /></Box>
        </Box>
        <Button onClick={onClose} sx={{ minWidth: 'auto', color: 'text.secondary' }}>✕</Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <Tab label="Overview" />
        <Tab label="Skills & Certs" />
        <Tab label="Project History" />
        <Tab label="Rationale" />
      </Tabs>

      <DialogContent sx={{ p: 2.5 }}>
        {tab === 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              {[
                { label: 'Utilization', value: `${r.employee.utilizationPct}%` },
                { label: 'Experience', value: `${r.employee.experienceYears} yrs` },
                { label: 'Bench Since', value: r.employee.benchSince ?? 'N/A' },
              ].map(({ label, value }) => (
                <Grid size={4} key={label}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: tokens.colors.neutral }}>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>{value}</Typography>
                    <Typography variant="body2">{label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h3" sx={{ mb: 1 }}>Skills</Typography>
            <Box sx={{ mb: 2 }}>
              {r.employee.skills.map(({ skill, proficiency }) => (
                <Box key={skill.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: `1px solid ${tokens.colors.border}` }}>
                  <Typography variant="body1">{skill.name}</Typography>
                  <StarRating value={proficiency} />
                </Box>
              ))}
            </Box>
          </>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="h3" sx={{ mb: 1.5 }}>Skills & Proficiency</Typography>
            {r.employee.skills.map(({ skill, proficiency }) => (
              <Box key={skill.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: `1px solid ${tokens.colors.border}` }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{skill.name}</Typography>
                  <Typography variant="body2">{skill.category}</Typography>
                </Box>
                <StarRating value={proficiency} />
              </Box>
            ))}
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant="h3" sx={{ mb: 1.5 }}>Past Allocations</Typography>
            {empAllocations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No allocation history found.</Typography>
            ) : (
              empAllocations.map((a) => (
                <Paper key={a.id} sx={{ p: 1.5, mb: 1.5, bgcolor: tokens.colors.neutralDark }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{a.projectName}</Typography>
                  <Typography variant="body2">{a.role} · {a.startDate}{a.endDate ? ` → ${a.endDate}` : ' (ongoing)'}</Typography>
                </Paper>
              ))
            )}
          </Box>
        )}

        {tab === 3 && (
          <Box>
            <Typography variant="h3" sx={{ mb: 1.5 }}>Why Recommended</Typography>
            <Paper sx={{ p: 2, bgcolor: '#E3F2FD', borderLeft: `4px solid ${tokens.colors.primary}` }}>
              {r.reasons.map((reason, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                  <CheckCircleOutlineIcon sx={{ color: tokens.colors.success, fontSize: 18, mt: '2px' }} />
                  <Typography variant="body1">{reason}</Typography>
                </Box>
              ))}
              {r.employee.skills.some((s) => s.skill.name === 'Python' && s.proficiency < 4) && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'flex-start' }}>
                  <WarningAmberIcon sx={{ color: tokens.colors.warning, fontSize: 18, mt: '2px' }} />
                  <Typography variant="body1">Limited Python proficiency</Typography>
                </Box>
              )}
            </Paper>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h3" sx={{ mb: 1 }}>Score Breakdown</Typography>
            {[
              { label: 'Skill Match', value: r.scoreBreakdown.skillMatch },
              { label: 'Project Experience', value: r.scoreBreakdown.projectExperience },
              { label: 'Availability', value: r.scoreBreakdown.availability },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${tokens.colors.border}` }}>
                <Typography variant="body1">{label}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.primary }}>{value} / 10</Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, borderTop: `1px solid ${tokens.colors.border}` }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button onClick={() => onAssign(r)} variant="contained">Assign Now</Button>
      </DialogActions>
    </Dialog>
  );
}
