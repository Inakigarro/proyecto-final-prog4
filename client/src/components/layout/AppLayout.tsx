import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Box, Container, CssBaseline, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Divider, Button, Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/context/AuthContext';

const DRAWER_WIDTH = 240;

// Ítems de navegación — se irán agregando a medida que avance el proyecto
const NAV_ITEMS = [
  { label: 'Inicio', path: '/', icon: <HomeIcon /> },
  { label: 'Carrito', path: '/carrito', icon: <ShoppingCartIcon /> },
];

export default function AppLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawerContenido = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700}>
          E-Commerce
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={() => setDrawerAbierto(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Barra superior */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerAbierto(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            E-Commerce
          </Typography>

          {/* Saludo + avatar — visible en desktop */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
              {usuario?.nombre[0].toUpperCase()}
            </Avatar>
            <Typography variant="body2">{usuario?.nombre}</Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil (temporal) */}
      <Drawer
        variant="temporary"
        open={drawerAbierto}
        onClose={() => setDrawerAbierto(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawerContenido}
      </Drawer>

      {/* Drawer desktop (permanente) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContenido}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
