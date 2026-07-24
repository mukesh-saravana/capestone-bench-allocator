import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Avatar, TextField, CircularProgress,
} from '@mui/material';
import type { Recommendation } from '../../types';
import { MOCK_PROJECT_NEEDS } from '../../lib/mockData';
import { tokens } from '../../theme';
import { useToast } from '../../store/ToastContext';

interface AssignmentModalProps {
  recommendation: Recommendation;
  projectNeedId?: string;
  onClose: () => void;
  onBack?: () => void;
}

export function AssignmentModal({ recommendation: r, projectNeedId, onClose, onBack }: AssignmentModalProps) {
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const need = MOCK_PROJECT_NEEDS.find((n) => n.id === projectNeedId) ?? MOCK_PROJECT_NEEDS[0];

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 900));
    setLoading(false);
    showToast(`✅ ${r.employee.name} assigned to ${need.projectName}`, 'success');
    onClose();
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
            <Typography variant="body1" sx={{ fontWeight: 600 }}>◼ {need.projectName}</Typography>
            <Typography variant="body2">Role: {need.roleTitle}</Typography>
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? 'Confirming…' : 'Confirm Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
