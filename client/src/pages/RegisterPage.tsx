import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, CircularProgress, Container,
  TextField, Typography, Alert, Paper,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await register({ nombre, email, password });
      // Redirige al login para que el usuario inicie sesión
      navigate('/login', { state: { mensaje: 'Cuenta creada. Podés iniciar sesión.' } });
    } catch (err: unknown) {
      const mensaje =
        (err as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
      setError(mensaje ?? 'Error al crear la cuenta');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: { xs: 4, sm: 10 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" mb={3}>
          Crear cuenta
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nombre"
            fullWidth
            required
            margin="normal"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
          />
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
            inputProps={{ minLength: 6 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            helperText="Mínimo 6 caracteres"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={cargando}
            sx={{ mt: 3, mb: 2 }}
          >
            {cargando ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
          </Button>

          <Typography variant="body2" textAlign="center">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: 'inherit' }}>
              Iniciá sesión
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
