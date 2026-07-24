import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useMediaQuery, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../../theme';

const SIDEBAR_WIDTH = 240;

const navItems = [
  { label: 'Dashboard',       icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Chat Assistant',  icon: <ChatIcon />,      path: '/chat' },
  { label: 'Recommendations', icon: <PeopleIcon />,    path: '/recommendations' },
  { label: 'Settings',        icon: <SettingsIcon />,  path: '/settings' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box sx={{ height: '100%', bgcolor: tokens.colors.neutralDark, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, py: 2.5, bgcolor: '#E8E8E8' }}>
        <Typography variant="h2" sx={{ color: tokens.colors.primary, fontSize: '1.25rem' }}>
          🏢 Bench Allocator
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>AI Resource Management</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map(({ label, icon, path }) => {
          const isActive = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                mx: 1, mb: 0.5, borderRadius: 1,
                bgcolor: isActive ? `${tokens.colors.primary}18` : 'transparent',
                color: isActive ? tokens.colors.primary : tokens.colors.textSecondary,
                '&:hover': { bgcolor: `${tokens.colors.primary}10` },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' } }}
      >
        <SidebarContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none' },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
