import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  ShoppingCart as CartIcon,
  Layers as LayersIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 256;

const menuItems = [
  { text: 'Administradores', icon: <AdminIcon />, path: '/administrators' },
  { text: 'Clientes', icon: <GroupIcon />, path: '/customers' },
  { text: 'Pedidos', icon: <CartIcon />, path: '/orders' },
  { text: 'Productos', icon: <InventoryIcon />, path: '/products' },
  { text: 'Variantes', icon: <LayersIcon />, path: '/variants' },
];

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <Box sx={{ px: 3, py: 4 }}>
        <Typography
          variant="h3"
          sx={{
            color: '#fff',
            fontFamily: '"Fugaz One", Inter, system-ui, sans-serif',
            fontWeight: 400,
            lineHeight: 0.95,
            fontSize: { xs: '2.25rem', md: '2.65rem' },
          }}
        >
          YIZER
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#ffd7d9', mt: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Panel administrador
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 2, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            sx={{
              mb: 0.75,
              borderRadius: 2,
              cursor: 'pointer',
              color: isActive(item.path) ? '#fff' : '#ffe9ea',
              fontWeight: isActive(item.path) ? 800 : 600,
              bgcolor: isActive(item.path) ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
              border: '1px solid',
              borderColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'inherit' }} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Paper
          sx={{
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.14)',
            boxShadow: 'none',
            color: '#fff',
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
            Sesión activa
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#ffd7d9', mt: 0.5, wordBreak: 'break-word' }}>
            {user?.email || user?.nombre_completo || 'Administrador'}
          </Typography>
        </Paper>
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            justifyContent: 'flex-start',
            color: '#fff',
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.18)',
            },
          }}
        >
          Cerrar sesión
        </Button>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#fff7f7',
        backgroundImage: 'var(--yizer-pattern), radial-gradient(circle at top right, rgba(215, 25, 32, 0.08), transparent 34rem), linear-gradient(180deg, #fffafa 0%, #fff3f3 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: '220px 220px, auto, auto',
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant={desktop ? 'permanent' : 'temporary'}
        open={desktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            bgcolor: '#8f1017',
            backgroundImage: 'linear-gradient(180deg, #b5121b 0%, #7c0d13 100%)',
            boxShadow: '12px 0 34px rgba(80, 10, 16, 0.24)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            position: 'fixed',
            top: 14,
            left: 14,
            zIndex: 30,
            color: '#a70f16',
            bgcolor: 'rgba(255, 250, 250, 0.92)',
            border: '1px solid rgba(139, 30, 36, 0.12)',
            boxShadow: '0 8px 24px rgba(98, 18, 24, 0.12)',
            '&:hover': {
              bgcolor: '#fff',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4, lg: 5 }, pt: { xs: 8, md: 4, lg: 5 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
