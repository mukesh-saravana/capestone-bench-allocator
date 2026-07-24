import { Box, Typography, Button, Tooltip, Avatar } from '@mui/material';
import type { Recommendation } from '../../types';
import { SkillChip, AvailabilityBadge } from '../../components/common/Badges';
import { ProgressBar } from '../../components/common/ProgressBar';
import { tokens } from '../../theme';

const rankColors = ['#4CAF50', '#2196F3', '#FF9800', '#9E9E9E'];

interface CandidateCardProps {
  recommendation: Recommendation;
  compact?: boolean;
  onViewProfile?: (r: Recommendation) => void;
  onAssign?: (r: Recommendation) => void;
}

export function CandidateCard({ recommendation: r, compact = false, onViewProfile, onAssign }: CandidateCardProps) {
  const rankColor = rankColors[Math.min(r.rank - 1, rankColors.length - 1)];
  const scoreBreakdownText = `Skill match: ${r.scoreBreakdown.skillMatch} · Experience: ${r.scoreBreakdown.projectExperience} · Availability: ${r.scoreBreakdown.availability}`;

  return (
    <Box
      sx={{
        display: 'flex', alignItems: compact ? 'flex-start' : 'center', gap: 2,
        p: compact ? 1.5 : 2,
        border: `1px solid ${r.rank === 1 ? tokens.colors.success : tokens.colors.border}`,
        borderLeft: `4px solid ${rankColor}`,
        borderRadius: 2, bgcolor: '#fff', mb: compact ? 1 : 2,
        boxShadow: 'none',
        transition: 'box-shadow 150ms ease',
        '&:hover': { boxShadow: tokens.shadows.raised },
      }}
    >
      {/* Rank Badge */}
      <Box sx={{
        width: compact ? 36 : 48, height: compact ? 36 : 48, borderRadius: '50%',
        bgcolor: rankColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: compact ? '1rem' : '1.25rem' }}>
          {r.rank}
        </Typography>
      </Box>

      {/* Avatar */}
      <Avatar sx={{ width: compact ? 32 : 44, height: compact ? 32 : 44, flexShrink: 0, bgcolor: tokens.colors.primary }}>
        {r.employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: tokens.colors.text }}>
            {r.employee.name}
          </Typography>
          <AvailabilityBadge status={r.employee.availability} />
        </Box>
        <Typography variant="body2" sx={{ mb: 0.75 }}>
          {r.employee.role} · {r.employee.department}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {r.employee.skills.slice(0, 4).map(({ skill }) => (
            <SkillChip key={skill.id} skill={skill.name} />
          ))}
        </Box>
      </Box>

      {/* Score */}
      {!compact && (
        <Box sx={{ textAlign: 'center', minWidth: 80, flexShrink: 0 }}>
          <Tooltip title={scoreBreakdownText} arrow>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: tokens.colors.primary, cursor: 'help' }}>
              {r.score.toFixed(1)}
            </Typography>
          </Tooltip>
          <Typography variant="body2" sx={{ mb: 0.5 }}>/10</Typography>
          <ProgressBar value={r.score * 10} height={4} />
        </Box>
      )}

      {/* Actions */}
      {!compact && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
          <Button size="small" variant="outlined" onClick={() => onViewProfile?.(r)}>View Profile</Button>
          <Button size="small" variant="contained" onClick={() => onAssign?.(r)}>Assign</Button>
        </Box>
      )}
    </Box>
  );
}
