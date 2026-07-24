import { useState } from 'react';
import { Box, Typography, TextField, MenuItem, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { Recommendation } from '../../types';
import { MOCK_RECOMMENDATIONS } from '../../lib/mockData';
import { CandidateCard } from './CandidateCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ProfileModal } from './ProfileModal';
import { AssignmentModal } from './AssignmentModal';

const DEPARTMENTS = ['All', 'Frontend', 'Backend', 'Platform', 'Data', 'DevOps'];
const SORT_OPTIONS = [{ label: 'Relevance', value: 'relevance' }, { label: 'Score ↓', value: 'score' }, { label: 'Name A–Z', value: 'name' }];

export function RecommendationsPage() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [sort, setSort] = useState('relevance');
  const [profileTarget, setProfileTarget] = useState<Recommendation | null>(null);
  const [assignTarget, setAssignTarget] = useState<Recommendation | null>(null);

  const filtered = MOCK_RECOMMENDATIONS
    .filter((r) => {
      const matchSearch = r.employee.name.toLowerCase().includes(search.toLowerCase()) ||
        r.employee.skills.some((s) => s.skill.name.toLowerCase().includes(search.toLowerCase()));
      const matchDept = dept === 'All' || r.employee.department === dept;
      return matchSearch && matchDept;
    })
    .sort((a, b) => {
      if (sort === 'score') return b.score - a.score;
      if (sort === 'name') return a.employee.name.localeCompare(b.employee.name);
      return a.rank - b.rank;
    });

  return (
    <Box>
      {/* Filter Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
            placeholder="Search by name or skill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        <TextField select label="Department" value={dept} onChange={(e) => setDept(e.target.value)} sx={{ minWidth: 160 }}>
          {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
        <TextField select label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 140 }}>
          {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        {(search || dept !== 'All') && (
          <Button variant="text" onClick={() => { setSearch(''); setDept('All'); }}>Clear Filters</Button>
        )}
      </Box>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Showing {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
      </Typography>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching candidates"
          description="Try adjusting filters or broadening your query."
        />
      ) : (
        filtered.map((r) => (
          <CandidateCard
            key={r.id}
            recommendation={r}
            onViewProfile={setProfileTarget}
            onAssign={setAssignTarget}
          />
        ))
      )}

      {profileTarget && (
        <ProfileModal
          recommendation={profileTarget}
          onClose={() => setProfileTarget(null)}
          onAssign={(r) => { setProfileTarget(null); setAssignTarget(r); }}
        />
      )}
      {assignTarget && (
        <AssignmentModal
          recommendation={assignTarget}
          onClose={() => setAssignTarget(null)}
          onBack={() => { setAssignTarget(null); setProfileTarget(assignTarget); }}
        />
      )}
    </Box>
  );
}
