# Settings Functionality Status

Last updated: 2026-07-28

## What is working

### General tab
- Theme, default view, and tooltip toggles are interactive.
- **Save Settings** stores values in browser `localStorage`.
- **Reset to Default** resets values and clears saved local settings.

### Data Management tab
- Dataset summary is fetched from backend (`GET /api/data/summary`).
- Dataset import supports (`POST /api/import/{dataset_key}`):
  - `candidate_profiles`
  - `employees`
  - `project_needs`
  - `allocation_history`
- Candidate dataset import supports:
  - `.csv`
  - `.xlsx`
- Candidate import compatibility endpoint remains wired (`POST /api/import/candidates`).
- Candidate export API is wired (`GET /api/export/candidates`).
- Refresh summary button works and refetches server data.
- Success/error toasts are shown for import/export actions.
- RAG index is refreshed after imports so chat/recommendations use the latest data.

### Skill Tags tab
- Skill tag list is fetched from backend (`GET /api/settings/skills`).
- Add skill is wired (`POST /api/settings/skills`).
- Edit skill is wired (`PUT /api/settings/skills/{id}`).
- Delete skill is wired (`DELETE /api/settings/skills/{id}`).
- Refresh action and mutation feedback toasts are working.

### RAG Admin tab
- Current RAG mode and retrieval mode are fetched from backend (`GET /api/rag/status`).
- Chunk counts for employees, project needs, and allocations are shown.
- Rebuild action is wired (`POST /api/rag/reindex`).
- Top bar also shows live RAG mode/status for quick visibility.

### Notifications tab
- Toggle controls and frequency selector are interactive.
- **Save Notifications** stores values in browser `localStorage`.

## What is not working yet / not implemented

### General tab
- Saved general settings are not yet applied globally to app theme/navigation behavior.
- Settings are not persisted in backend DB (local browser only).

### Data Management tab
- Data validation reports are basic (row-level error only, no downloadable error report).

### Notifications tab
- Notification preferences are not connected to backend notification delivery.
- No email scheduler/queue integration exists yet.

## Recommended next steps

1. Add backend persistence for General/Notification settings per user.
2. Add richer import validation report (invalid rows file + reason per row).
3. Apply saved settings dynamically in frontend (theme/default landing route/tooltips).
