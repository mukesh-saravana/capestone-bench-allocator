import {
  Box, Paper, Tabs, Tab, Typography, Switch, FormControlLabel,
  Radio, RadioGroup, FormControl, FormLabel, Button, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton,
} from '@mui/material';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { tokens } from '../../theme';

const SAMPLE_SKILLS = [
  { name: 'React', category: 'Frontend', usage: 12 },
  { name: 'TypeScript', category: 'Frontend', usage: 10 },
  { name: 'Python', category: 'Backend', usage: 8 },
  { name: 'AWS', category: 'Cloud', usage: 9 },
  { name: 'Docker', category: 'DevOps', usage: 6 },
  { name: 'PostgreSQL', category: 'Data', usage: 5 },
];

const DATASETS = [
  { label: 'Employee Data', lastUpdated: '2026-07-20', rows: 30 },
  { label: 'Projects Data', lastUpdated: '2026-07-22', rows: 10 },
  { label: 'Allocations History', lastUpdated: '2026-07-22', rows: 50 },
];

function UploadArea({ label }: { label: string }) {
  return (
    <Box sx={{
      border: `2px dashed ${tokens.colors.border}`, borderRadius: 2,
      p: 2.5, textAlign: 'center', cursor: 'pointer', mb: 1.5,
      '&:hover': { borderColor: tokens.colors.primary, bgcolor: '#E3F2FD10' },
    }}>
      <CloudUploadIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>{label}</Typography>
      <Typography variant="body2">Drag & drop CSV or <span style={{ color: tokens.colors.primary }}>Browse</span></Typography>
    </Box>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState(0);

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
          {/* General */}
          {tab === 0 && (
            <Box sx={{ maxWidth: 480 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>General Settings</Typography>
              <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>Theme</FormLabel>
                <RadioGroup row defaultValue="light">
                  <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
                  <FormControlLabel value="dark" control={<Radio size="small" />} label="Dark" />
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>Default View</FormLabel>
                <RadioGroup row defaultValue="dashboard">
                  <FormControlLabel value="dashboard" control={<Radio size="small" />} label="Dashboard" />
                  <FormControlLabel value="chat" control={<Radio size="small" />} label="Chat" />
                </RadioGroup>
              </FormControl>
              <FormControlLabel
                control={<Switch defaultChecked size="small" />}
                label="Show tooltips on candidate cards"
                sx={{ mb: 3, display: 'block' }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained">Save Settings</Button>
                <Button variant="outlined" color="inherit">Reset to Default</Button>
              </Box>
            </Box>
          )}

          {/* Skill Tags */}
          {tab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h3">Skill Tags</Typography>
                <Button variant="contained" size="small" startIcon={<AddIcon />}>Add Skill</Button>
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
                  {SAMPLE_SKILLS.map((s) => (
                    <TableRow key={s.name} sx={{ '&:hover': { bgcolor: tokens.colors.background } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                      <TableCell><Chip label={s.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                      <TableCell align="center">{s.usage}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Data Management */}
          {tab === 2 && (
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>Upload Datasets</Typography>
              {DATASETS.map((d) => (
                <Box key={d.label}>
                  <UploadArea label={d.label} />
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    Last updated: {d.lastUpdated} · {d.rows} records
                    <Button size="small" sx={{ ml: 1 }}>Refresh</Button>
                    <Button size="small">Export</Button>
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                </Box>
              ))}
            </Box>
          )}

          {/* Notifications */}
          {tab === 3 && (
            <Box sx={{ maxWidth: 480 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>Notifications</Typography>
              {[
                'Email notifications',
                'Allocation updates',
                'Recommendations available',
              ].map((label) => (
                <FormControlLabel
                  key={label}
                  control={<Switch defaultChecked size="small" />}
                  label={label}
                  sx={{ display: 'block', mb: 1.5 }}
                />
              ))}
              <Divider sx={{ my: 2 }} />
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>Frequency</FormLabel>
                <RadioGroup defaultValue="daily">
                  <FormControlLabel value="daily" control={<Radio size="small" />} label="Daily" />
                  <FormControlLabel value="weekly" control={<Radio size="small" />} label="Weekly" />
                  <FormControlLabel value="off" control={<Radio size="small" />} label="Off" />
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
