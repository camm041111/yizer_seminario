import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/products');
    } else {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, rgba(143, 16, 23, 0.94), rgba(215, 25, 32, 0.86)), url(/favicon.svg)',
        backgroundSize: 'cover',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            p: { xs: 3, sm: 5 },
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.42)',
            boxShadow: '0 30px 80px rgba(70, 10, 16, 0.28)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 2,
                bgcolor: '#d71920',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 16px 34px rgba(215, 25, 32, 0.26)',
              }}
            >
              <LockIcon fontSize="medium" />
            </Box>
            <Typography variant="h4">
              Panel Yizer
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Acceso para administradores
            </Typography>
          </Box>

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button type="submit" fullWidth variant="contained">
          Iniciar sesión
        </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
