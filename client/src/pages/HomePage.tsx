import { Typography, Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

/** Página de inicio — placeholder hasta tener el catálogo de productos */
export default function HomePage() {
  const { usuario } = useAuth();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Bienvenido, {usuario?.nombre}
      </Typography>
      <Typography color="text.secondary">
        El catálogo de productos estará disponible próximamente.
      </Typography>
    </Box>
  );
}
