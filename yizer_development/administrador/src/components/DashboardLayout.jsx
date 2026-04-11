import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  ShoppingCart as CartIcon,
  Layers as LayersIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
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
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fffbff' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            bgcolor: 'rgba(255, 241, 241, 0.3)',
          },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <Box sx={{ px: 3, py: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.025em', color: '#dc2626' }}>
            Yizer
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#534341', mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Admin Console
          </Typography>
        </Box>

        <List sx={{ flex: 1, px: 2, overflowY: 'auto' }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                color: isActive(item.path) ? '#dc2626' : '#534341',
                fontWeight: isActive(item.path) ? 700 : 500,
                bgcolor: isActive(item.path) ? 'rgba(220, 38, 38, 0.05)' : 'transparent',
                borderRight: isActive(item.path) ? '4px solid #dc2626' : 'none',
                '&:hover': {
                  bgcolor: 'rgba(220, 38, 38, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </ListItem>
          ))}
        </List>

        
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { md: `${drawerWidth}px` } }}>
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            zIndex: 30,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, maxWidth: 512 }}>
              <Paper
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#fff1f1',
                  borderRadius: '9999px',
                  px: 2,
                  py: 0.5,
                }}
              >
                <SearchIcon sx={{ color: '#857371', mr: 1 }} />
                <InputBase
                  placeholder="Search across console..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.875rem' }}
                />
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 3 }}>
              <IconButton sx={{ color: '#534341', position: 'relative' }}>
                <NotificationsIcon />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    bgcolor: '#ba1a1a',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }}
                />
              </IconButton>

              <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(216, 194, 191, 0.3)', mx: 1 }} />

              <Button
                onClick={handleLogout}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent', color: '#ef4444' },
                }}
              >
                Logout
              </Button>

              <Avatar
                src={user?.avatar}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid #ffdad6',
                  p: 0.5,
                }}
              />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 4, md: 6, lg: 8 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
