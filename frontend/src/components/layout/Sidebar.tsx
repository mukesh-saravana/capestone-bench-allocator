import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery, useTheme, Chip, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../../theme';
import { useAuth } from '../../store/AuthContext';

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
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'DM';

  return (
    <Box sx={{ height: '100%', background: tokens.gradients.sidebar, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Brand */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          '&::after': {
            content: '""',
            display: 'block',
            height: 1,
            bgcolor: 'rgba(255,255,255,0.08)',
            mt: 1,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

      {/* Nav label */}
      <Typography
        sx={{
          px: 3,
          pb: 1,
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'rgba(148,163,184,0.8)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          bgcolor: 'transparent',
        }}
      >
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
                color: isActive ? '#FFFFFF' : 'rgba(226,232,240,0.92)',
                boxShadow: isActive ? '0 10px 24px rgba(67,97,238,0.24)' : 'none',
                transform: 'translateX(0)',
                transition: 'background 260ms cubic-bezier(0.22, 1, 0.36, 1), border-color 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms ease',
                '&:hover': {
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(67,97,238,0.4) 0%, rgba(67,97,238,0.2) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: isActive ? 'rgba(99,120,255,0.5)' : 'rgba(255,255,255,0.12)',
                  boxShadow: isActive ? '0 12px 26px rgba(67,97,238,0.3)' : '0 8px 18px rgba(15,23,42,0.35)',
                  transform: 'translateX(4px)',
                  color: '#FFFFFF',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? '#FFFFFF' : 'rgba(226,232,240,0.92)',
                  transition: 'color 220ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : 'rgba(226,232,240,0.92)',
                    transition: 'color 220ms ease, letter-spacing 220ms ease',
                    letterSpacing: isActive ? '0.01em' : '0',
                  },
                }}
              />
              {badge && (
                <Chip label={badge} size="small"
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: `${tokens.colors.primary}40`, color: tokens.colors.primaryLight, border: `1px solid ${tokens.colors.primary}60` }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer — user profile */}
      <Box sx={{ px: 1.5, pb: 2 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 1.5, py: 1.25, borderRadius: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'default',
        }}>
          <Avatar sx={{
            width: 32, height: 32, flexShrink: 0,
            background: tokens.gradients.primary,
            fontSize: '0.7rem', fontWeight: 700,
            boxShadow: tokens.shadows.colored(tokens.colors.primary),
          }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#E2E8F0', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name ?? 'Demo Manager'}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.sidebarText, lineHeight: 1.3 }}>
              {user?.role ?? 'Resource Manager'}
            </Typography>
          </Box>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tokens.colors.success, flexShrink: 0, boxShadow: `0 0 6px ${tokens.colors.success}80` }} />
        </Box>
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
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            overflow: 'hidden',
          },
        }}
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
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
          overflow: 'hidden',
          boxShadow: '6px 0 28px rgba(0,0,0,0.14)',
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
