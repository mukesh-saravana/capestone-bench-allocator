import {
  Box, Paper, Tabs, Tab, Typography, Switch, FormControlLabel,
  Radio, RadioGroup, FormControl, FormLabel, Button, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton,
  CircularProgress,
} from '@mui/material';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { tokens } from '../../theme';
import { exportCandidates, getDataSummary, importCandidates } from '../../lib/api';
import { useToast } from '../../store/ToastContext';
import type { DataSetSummary } from '../../types';

const SAMPLE_SKILLS = [
  { name: 'React', category: 'Frontend', usage: 12 },
  { name: 'TypeScript', category: 'Frontend', usage: 10 },
  { name: 'Python', category: 'Backend', usage: 8 },
  { name: 'AWS', category: 'Cloud', usage: 9 },
  { name: 'Docker', category: 'DevOps', usage: 6 },
  { name: 'PostgreSQL', category: 'Data', usage: 5 },
];

interface UploadAreaProps {
  label: string;
  enabled: boolean;
  uploading: boolean;
  onClick: () => void;
}

function UploadArea({ label, enabled, uploading, onClick }: UploadAreaProps) {
  return (
    <Box
      onClick={enabled && !uploading ? onClick : undefined}
      sx={{
        border: `2px dashed ${enabled ? tokens.colors.border : `${tokens.colors.border}80`}`,
        borderRadius: 2,
        p: 2.5,
        textAlign: 'center',
        cursor: enabled && !uploading ? 'pointer' : 'not-allowed',
        mb: 1.5,
        opacity: enabled ? 1 : 0.65,
        '&:hover': enabled && !uploading ? { borderColor: tokens.colors.primary, bgcolor: '#E3F2FD10' } : undefined,
      }}
    >
      {uploading ? <CircularProgress size={24} sx={{ mb: 0.5 }} /> : <CloudUploadIcon sx={{ color: 'text.secondary', mb: 0.5 }} />}
      <Typography variant="body1" sx={{ fontWeight: 500 }}>{label}</Typography>
      <Typography variant="body2">
        {enabled ? 'Upload CSV/XLSX using Browse' : 'Import not enabled for this dataset yet'}
      </Typography>
    </Box>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function SettingsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [defaultView, setDefaultView] = useState<'dashboard' | 'chat'>('dashboard');
  const [showTooltips, setShowTooltips] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [allocationNotifications, setAllocationNotifications] = useState(true);
  const [recommendationNotifications, setRecommendationNotifications] = useState(true);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'off'>('daily');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const summaryQuery = useQuery({ queryKey: ['settings', 'data-summary'], queryFn: getDataSummary });
  const importMutation = useMutation({
    mutationFn: importCandidates,
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings', 'data-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['employees'] }),
        queryClient.invalidateQueries({ queryKey: ['recommendations'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'bench'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'utilization'] }),
      ]);
      showToast(`Import completed: ${result.imported} added, ${result.updated} updated, ${result.skipped} skipped`, 'success');
    },
    onError: () => {
      showToast('Candidate import failed. Please check file format and try again.', 'error');
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportCandidates,
    onSuccess: (blob) => {
      downloadBlob(blob, 'candidates-export.csv');
      showToast('Candidate export downloaded.', 'success');
    },
    onError: () => {
      showToast('Candidate export failed.', 'error');
    },
  });

  const dataSets = useMemo(() => summaryQuery.data ?? [], [summaryQuery.data]);
  const candidateDataset = dataSets.find((dataset) => dataset.key === 'candidate_profiles') ?? null;

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    void importMutation.mutateAsync(file);
    event.target.value = '';
  };

  const saveGeneral = () => {
    localStorage.setItem(
      'settings_general',
      JSON.stringify({ theme, defaultView, showTooltips })
    );
    showToast('General settings saved locally.', 'success');
  };

  const resetGeneral = () => {
    setTheme('light');
    setDefaultView('dashboard');
    setShowTooltips(true);
    localStorage.removeItem('settings_general');
    showToast('General settings reset.', 'info');
  };

  const saveNotifications = () => {
    localStorage.setItem(
      'settings_notifications',
      JSON.stringify({
        emailNotifications,
        allocationNotifications,
        recommendationNotifications,
        frequency,
      })
    );
    showToast('Notification settings saved locally.', 'success');
  };

  return (
    <Box>
      <Paper sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Tab label="General" />
          <Tab label="Skill Tags" />
          <Tab label="Data Management" />
          <Tab label="Notifications" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Box sx={{ maxWidth: 480 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>General Settings</Typography>
              <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>Theme</FormLabel>
                <RadioGroup row value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
                  <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
                  <FormControlLabel value="dark" control={<Radio size="small" />} label="Dark" />
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>Default View</FormLabel>
                <RadioGroup row value={defaultView} onChange={(e) => setDefaultView(e.target.value as 'dashboard' | 'chat')}>
                  <FormControlLabel value="dashboard" control={<Radio size="small" />} label="Dashboard" />
                  <FormControlLabel value="chat" control={<Radio size="small" />} label="Chat" />
                </RadioGroup>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={showTooltips} onChange={(_, checked) => setShowTooltips(checked)} size="small" />}
                label="Show tooltips on candidate cards"
                sx={{ mb: 3, display: 'block' }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={saveGeneral}>Save Settings</Button>
                <Button variant="outlined" color="inherit" onClick={resetGeneral}>Reset to Default</Button>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h3">Skill Tags</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => showToast('Skill tag CRUD will be connected in next backend iteration.', 'info')}
                >
                  Add Skill
                </Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: tokens.colors.neutralDark, fontWeight: 600 } }}>
                    <TableCell>Skill</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Usage</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SAMPLE_SKILLS.map((skill) => (
                    <TableRow key={skill.name} sx={{ '&:hover': { bgcolor: tokens.colors.background } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{skill.name}</TableCell>
                      <TableCell><Chip label={skill.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                      <TableCell align="center">{skill.usage}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => showToast('Edit skill is not wired yet.', 'info')}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => showToast('Delete skill is not wired yet.', 'info')}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>Upload Datasets</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => void queryClient.invalidateQueries({ queryKey: ['settings', 'data-summary'] })}
                sx={{ mb: 2 }}
              >
                Refresh Summary
              </Button>

              {summaryQuery.isLoading && (
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              )}

              {summaryQuery.isError && (
                <Typography color="error" sx={{ mb: 2 }}>
                  Failed to load data summary.
                </Typography>
              )}

              {dataSets.map((dataset: DataSetSummary) => (
                <Box key={dataset.key}>
                  <UploadArea
                    label={dataset.label}
                    enabled={dataset.importEnabled}
                    uploading={importMutation.isPending}
                    onClick={handleOpenFileDialog}
                  />
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    Last updated: {dataset.lastUpdated} · {dataset.rows} records
                    <Button size="small" sx={{ ml: 1 }} onClick={() => void queryClient.invalidateQueries({ queryKey: ['settings', 'data-summary'] })}>
                      Refresh
                    </Button>
                    {dataset.key === 'candidate_profiles' ? (
                      <Button
                        size="small"
                        startIcon={exportMutation.isPending ? <CircularProgress size={12} /> : <DownloadIcon fontSize="small" />}
                        onClick={() => void exportMutation.mutateAsync()}
                        disabled={exportMutation.isPending}
                      >
                        Export
                      </Button>
                    ) : (
                      <Button size="small" disabled>
                        Export
                      </Button>
                    )}
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                </Box>
              ))}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Typography variant="body2" sx={{ color: tokens.colors.textTertiary }}>
                Candidate import supports `.csv` and `.xlsx` with required columns:
                candidate_id, name, email, role, department, experience_years, skills, availability, utilization_pct, interview_score, interview_result.
              </Typography>

              {candidateDataset && (
                <Typography variant="body2" sx={{ color: tokens.colors.textTertiary, mt: 0.5 }}>
                  Tip: skills should be pipe-separated, for example: React|TypeScript|AWS
                </Typography>
              )}
            </Box>
          )}

          {tab === 3 && (
            <Box sx={{ maxWidth: 480 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>Notifications</Typography>
              <FormControlLabel
                control={<Switch checked={emailNotifications} onChange={(_, checked) => setEmailNotifications(checked)} size="small" />}
                label="Email notifications"
                sx={{ display: 'block', mb: 1.5 }}
              />
              <FormControlLabel
                control={<Switch checked={allocationNotifications} onChange={(_, checked) => setAllocationNotifications(checked)} size="small" />}
                label="Allocation updates"
                sx={{ display: 'block', mb: 1.5 }}
              />
              <FormControlLabel
                control={<Switch checked={recommendationNotifications} onChange={(_, checked) => setRecommendationNotifications(checked)} size="small" />}
                label="Recommendations available"
                sx={{ display: 'block', mb: 1.5 }}
              />
              <Divider sx={{ my: 2 }} />
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>Frequency</FormLabel>
                <RadioGroup value={frequency} onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'off')}>
                  <FormControlLabel value="daily" control={<Radio size="small" />} label="Daily" />
                  <FormControlLabel value="weekly" control={<Radio size="small" />} label="Weekly" />
                  <FormControlLabel value="off" control={<Radio size="small" />} label="Off" />
                </RadioGroup>
              </FormControl>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={saveNotifications}>Save Notifications</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
