import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, TextField, CircularProgress,
} from '@mui/material';
import type { ProjectNeed, Recommendation } from '../../types';
import { tokens } from '../../theme';
import { useToast } from '../../store/ToastContext';
import { createAllocation } from '../../lib/api';

interface AssignmentModalProps {
  recommendation: Recommendation;
  projectNeed: ProjectNeed | null;
  onClose: () => void;
  onBack?: () => void;
  onAssigned?: () => void;
}

export function AssignmentModal({ recommendation: r, projectNeed, onClose, onBack, onAssigned }: AssignmentModalProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const assignMutation = useMutation({
    mutationFn: createAllocation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'allocations'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'bench'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'utilization'] }),
        queryClient.invalidateQueries({ queryKey: ['employees'] }),
        queryClient.invalidateQueries({ queryKey: ['project-needs'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations'] }),
        queryClient.invalidateQueries({ queryKey: ['allocation-history'] }),
      ]);
    },
  });

  const handleConfirm = async () => {
    if (!projectNeed) {
      showToast('No project need selected for this assignment.', 'error');
      return;
    }
    try {
      await assignMutation.mutateAsync({
        employeeId: r.employee.id,
        projectNeedId: projectNeed.id,
        role: projectNeed.roleTitle,
        startDate,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      showToast(`✅ ${r.employee.name} assigned to ${projectNeed.projectName}`, 'success');
      onAssigned?.();
      onClose();
    } catch {
      showToast('Failed to create allocation. Please try again.', 'error');
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: `1px solid ${tokens.colors.border}`, pb: 2 }}>
        Confirm Allocation
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        {/* Candidate summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, p: 2, bgcolor: tokens.colors.neutralDark, borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: tokens.colors.primary }}>
            {r.employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Assigning: {r.employee.name}</Typography>
            <Typography variant="body2">{r.employee.role} · {r.employee.department}</Typography>
          </Box>
        </Box>

        {/* Project */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>To Project</Typography>
          <Box sx={{ p: 1.5, border: `1px solid ${tokens.colors.border}`, borderRadius: 1.5 }}>
            {projectNeed ? (
              <>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>◼ {projectNeed.projectName}</Typography>
                <Typography variant="body2">Role: {projectNeed.roleTitle}</Typography>
              </>
            ) : (
              <Typography variant="body2">No project need selected.</Typography>
            )}
          </Box>
        </Box>

        {/* Start date */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>Start Date</Typography>
          <TextField
            type="date" value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth slotProps={{ htmlInput: { min: new Date().toISOString().split('T')[0] } }}
          />
        </Box>

        {/* Notes */}
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>Notes (optional)</Typography>
          <TextField
            multiline rows={2} fullWidth value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any context for this allocation…"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, borderTop: `1px solid ${tokens.colors.border}` }}>
        {onBack && <Button onClick={onBack} variant="text" sx={{ mr: 'auto' }}>← Back</Button>}
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button
          onClick={handleConfirm} variant="contained"
          disabled={assignMutation.isPending || !projectNeed}
          startIcon={assignMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {assignMutation.isPending ? 'Confirming…' : 'Confirm Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
