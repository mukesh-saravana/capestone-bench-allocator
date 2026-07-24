import { AppBar, Toolbar, Typography, IconButton, Box, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { tokens } from '../../theme';
import { SIDEBAR_WIDTH } from './Sidebar';

const pageTitles: Record<string, string> = {
  '/dashboard':       'Resource Allocation Dashboard',
  '/chat':            'Chat Assistant',
  '/recommendations': 'Recommended Candidates',
  '/settings':        'Settings',
};

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const title = pageTitles[pathname] ?? 'Bench Allocator';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: isMobile ? '100%' : `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
        bgcolor: '#fff',
        borderBottom: `1px solid ${tokens.colors.border}`,
        color: tokens.colors.text,
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h2" sx={{ flex: 1, fontSize: '1.125rem' }}>{title}</Typography>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="Export"><IconButton size="small"><FileDownloadOutlinedIcon /></IconButton></Tooltip>
          <Tooltip title="Notifications"><IconButton size="small"><NotificationsOutlinedIcon /></IconButton></Tooltip>
          <Tooltip title={user?.name ?? 'Profile'}><IconButton size="small"><AccountCircleOutlinedIcon /></IconButton></Tooltip>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={logout}><LogoutIcon /></IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
