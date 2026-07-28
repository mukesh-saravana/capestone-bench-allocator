import { Box, Typography, Button, Tooltip, Avatar, Chip } from '@mui/material';
import type { Recommendation } from '../../types';
import { AvailabilityBadge } from '../../components/common/Badges';
import { tokens } from '../../theme';

const rankGradients = [
  tokens.gradients.primary,
  'linear-gradient(135deg, #4ECDC4 0%, #2CB5B0 100%)',
  tokens.gradients.warning,
  'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
];

interface CandidateCardProps {
  recommendation: Recommendation;
  compact?: boolean;
  onViewProfile?: (r: Recommendation) => void;
  onAssign?: (r: Recommendation) => void;
}

export function CandidateCard({ recommendation: r, compact = false, onViewProfile, onAssign }: CandidateCardProps) {
  const rankGradient = rankGradients[Math.min(r.rank - 1, rankGradients.length - 1)];
  const scoreBreakdownText = `Skill match: ${r.scoreBreakdown.skillMatch} · Experience: ${r.scoreBreakdown.projectExperience} · Availability: ${r.scoreBreakdown.availability}`;
  const scoreColor = r.score >= 9 ? tokens.colors.success : r.score >= 7 ? tokens.colors.primary : tokens.colors.warning;

  return (
    <Box
      onClick={() => !compact && onViewProfile?.(r)}
      sx={{
        display: 'flex', alignItems: compact ? 'flex-start' : 'center', gap: 2,
        p: compact ? 1.5 : 2.5,
        bgcolor: 'white',
        border: `1px solid ${r.rank === 1 ? `${tokens.colors.success}40` : tokens.colors.border}`,
        borderRadius: `${tokens.borderRadius.md}px`,
        mb: compact ? 1 : 2,
        boxShadow: r.rank === 1 ? tokens.shadows.colored(tokens.colors.success) : tokens.shadows.xs,
        transition: 'all 200ms ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: !compact && onViewProfile ? 'pointer' : 'default',
        '&:hover': !compact && onViewProfile ? {
          boxShadow: tokens.shadows.md,
          transform: 'translateY(-2px)',
          borderColor: r.rank === 1 ? `${tokens.colors.success}60` : `${tokens.colors.primary}30`,
        } : { boxShadow: tokens.shadows.md, transform: 'translateY(-1px)' },
        '&::before': r.rank === 1 ? {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: tokens.gradients.success,
        } : undefined,
      }}
    >
      {/* Rank Badge */}
      <Box sx={{
        width: compact ? 36 : 52, height: compact ? 36 : 52, borderRadius: '50%',
        background: rankGradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: compact ? '0.875rem' : '1.125rem' }}>
          {r.rank}
        </Typography>
      </Box>

      {/* Avatar */}
      <Avatar sx={{
        width: compact ? 32 : 44, height: compact ? 32 : 44, flexShrink: 0,
        background: tokens.gradients.primary, fontSize: compact ? '0.7rem' : '0.875rem', fontWeight: 700,
      }}>
        {r.employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: tokens.colors.text }}>
            {r.employee.name}
          </Typography>
          <AvailabilityBadge status={r.employee.availability} />
          {r.rank === 1 && !compact && (
            <Chip label="Best Match" size="small"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, background: `${tokens.colors.success}15`, color: tokens.colors.success, border: `1px solid ${tokens.colors.success}30` }} />
          )}
        </Box>
        <Typography sx={{ fontSize: '0.8rem', color: tokens.colors.textTertiary, mb: 0.75 }}>
          {r.employee.role} · {r.employee.department} · {r.employee.experienceYears} yrs exp
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {r.employee.skills.slice(0, compact ? 2 : 4).map(({ skill }) => (
            <Chip key={skill.id} label={skill.name} size="small"
              sx={{ fontSize: '0.68rem', height: 20, bgcolor: `${tokens.colors.primary}10`, color: tokens.colors.primary, border: `1px solid ${tokens.colors.primary}20` }} />
          ))}
        </Box>
      </Box>

      {/* Score */}
      {!compact && (
        <Tooltip title={scoreBreakdownText} arrow>
          <Box sx={{ textAlign: 'center', minWidth: 72, flexShrink: 0, cursor: 'help' }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: scoreColor, lineHeight: 1 }}>
              {r.score.toFixed(1)}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.textTertiary, mb: 0.5 }}>/10</Typography>
            <Box sx={{ height: 4, borderRadius: 2, bgcolor: `${scoreColor}20`, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${r.score * 10}%`, background: scoreColor === tokens.colors.success ? tokens.gradients.success : tokens.gradients.primary, borderRadius: 2 }} />
            </Box>
          </Box>
        </Tooltip>
      )}

      {/* Actions */}
      {!compact && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <Button size="small" variant="outlined"
            sx={{ fontSize: '0.75rem', px: 1.5, borderColor: tokens.colors.border, color: tokens.colors.text, '&:hover': { borderColor: tokens.colors.primary, color: tokens.colors.primary } }}
            onClick={() => onViewProfile?.(r)}>
            View Profile
          </Button>
          <Button size="small" variant="contained" sx={{ fontSize: '0.75rem', px: 1.5 }} onClick={() => onAssign?.(r)}>
            Assign
          </Button>
        </Box>
      )}
    </Box>
  );
}
