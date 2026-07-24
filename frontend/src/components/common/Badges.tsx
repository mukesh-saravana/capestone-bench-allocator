import { Chip, type ChipProps } from '@mui/material';
import type { AvailabilityStatus, Priority } from '../../types';
import { tokens } from '../../theme';

// ─── Availability Badge ───────────────────────────────────────────────────────

const availabilityConfig: Record<AvailabilityStatus, { label: string; color: string; bg: string }> = {
  available:  { label: 'Available',  color: '#fff', bg: tokens.colors.success },
  allocated:  { label: 'Allocated',  color: '#fff', bg: tokens.colors.primary },
  on_leave:   { label: 'On Leave',   color: '#fff', bg: tokens.colors.warning },
  exiting:    { label: 'Exiting',    color: '#fff', bg: tokens.colors.danger },
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const cfg = availabilityConfig[status];
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem' }}
    />
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  high:   { label: 'High',   color: '#fff', bg: tokens.colors.danger },
  medium: { label: 'Medium', color: '#fff', bg: tokens.colors.warning },
  low:    { label: 'Low',    color: '#fff', bg: tokens.colors.success },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority];
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem' }}
    />
  );
}

// ─── Skill Chip ───────────────────────────────────────────────────────────────

interface SkillChipProps extends Omit<ChipProps, 'label'> {
  skill: string;
}

export function SkillChip({ skill, ...props }: SkillChipProps) {
  return (
    <Chip
      label={skill}
      size="small"
      variant="outlined"
      sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, fontSize: '0.7rem' }}
      {...props}
    />
  );
}
