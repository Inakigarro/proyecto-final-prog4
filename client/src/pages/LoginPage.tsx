import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, CircularProgress, Container,
  TextField, Typography, Alert, Paper,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch {
      setError('Email o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 4, sm: 10 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" mb={3}>
          Iniciar sesión
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={cargando}
            sx={{ mt: 3, mb: 2 }}
          >
            {cargando ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>

          <Typography variant="body2" textAlign="center">
            ¿No tenés cuenta?{' '}
            <Link to="/register" style={{ color: 'inherit' }}>
              Registrate
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
