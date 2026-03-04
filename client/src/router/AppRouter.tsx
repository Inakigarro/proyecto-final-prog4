import { Navigate, Route, Routes } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HomePage from '@/pages/HomePage';

/**
 * Ruta protegida: redirige a /login si el usuario no está autenticado.
 * Muestra un spinner mientras se verifica la sesión guardada.
 */
function RutaProtegida({ children }: { children: JSX.Element }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return usuario ? children : <Navigate to="/login" replace />;
}

/** Ruta pública: redirige al inicio si el usuario ya está autenticado */
function RutaPublica({ children }: { children: JSX.Element }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;

  return !usuario ? children : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<RutaPublica><LoginPage /></RutaPublica>} />
      <Route path="/register" element={<RutaPublica><RegisterPage /></RutaPublica>} />

      {/* Rutas protegidas con layout */}
      <Route element={<RutaProtegida><AppLayout /></RutaProtegida>}>
        <Route path="/" element={<HomePage />} />
        {/* Aquí se irán agregando las rutas del e-commerce */}
      </Route>

      {/* Cualquier ruta no definida redirige al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
