import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery, useTheme, Chip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../../theme';

const SIDEBAR_WIDTH = 252;

const navItems = [
  { label: 'Dashboard',       icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
  { label: 'Chat Assistant',  icon: <ChatIcon fontSize="small" />,      path: '/chat',            badge: 'AI' },
  { label: 'Recommendations', icon: <PeopleIcon fontSize="small" />,    path: '/recommendations' },
  { label: 'Settings',        icon: <SettingsIcon fontSize="small" />,  path: '/settings' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box sx={{ height: '100%', background: tokens.gradients.sidebar, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Brand */}
      <Box sx={{ px: 3, py: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: tokens.gradients.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: tokens.shadows.colored(tokens.colors.primary),
          }}>
            <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#FFFFFF', lineHeight: 1.2 }}>
              Bench Allocator
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.sidebarText, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AI Resource Mgmt
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 3, height: 1, bgcolor: 'rgba(255,255,255,0.08)', mb: 1.5 }} />

      {/* Nav label */}
      <Typography sx={{ px: 3, pb: 1, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(148,163,184,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Navigation
      </Typography>

      <List sx={{ flex: 1, px: 1.5, pb: 1 }}>
        {navItems.map(({ label, icon, path, badge }) => {
          const isActive = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                mb: 0.5, borderRadius: 1.5, px: 1.5, py: 1.25,
                background: isActive ? 'linear-gradient(135deg, rgba(67,97,238,0.35) 0%, rgba(67,97,238,0.15) 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(67,97,238,0.3)' : '1px solid transparent',
                color: isActive ? '#FFFFFF' : tokens.colors.sidebarText,
                transition: 'all 180ms ease',
                '&:hover': {
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(67,97,238,0.4) 0%, rgba(67,97,238,0.2) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  color: '#FFFFFF',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive ? tokens.colors.primaryLight : 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 } }}
              />
              {badge && (
                <Chip label={badge} size="small"
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: `${tokens.colors.primary}40`, color: tokens.colors.primaryLight, border: `1px solid ${tokens.colors.primary}60` }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ px: 2, py: 2, mx: 1.5, mb: 2, borderRadius: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.sidebarText, lineHeight: 1.5 }}>
          MVP Demo · v1.0
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.5)' }}>
          RAG-powered staffing
        </Typography>
      </Box>
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
        sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none' } }}
      >
        <SidebarContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.08)' },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
