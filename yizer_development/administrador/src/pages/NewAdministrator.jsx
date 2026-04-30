import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewAdministrator = () => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.nombre_completo || !formData.email || !formData.password) {
      setError('Nombre completo, email y contraseña son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/administradores', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSuccess('Administrador creado exitosamente');
      setTimeout(() => {
        navigate('/administrators');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4">
          Nuevo administrador
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Agrega una cuenta con acceso al panel administrativo.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nombre Completo"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="button"
              onClick={() => navigate('/administrators')}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Administrador'}
            </Button>
          </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NewAdministrator;
