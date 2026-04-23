import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EditAdministrator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdministrator = async () => {
      try {
        const response = await axios.get(`/api/administradores/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData({
          nombre_completo: response.data.nombre_completo || '',
          email: response.data.email || '',
          telefono: response.data.telefono || '',
          password: '',
        });
      } catch (err) {
        setError('No se pudo cargar el administrador');
      } finally {
        setLoading(false);
      }
    };

    fetchAdministrator();
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre_completo || !formData.email) {
      setError('Nombre completo y email son obligatorios');
      return;
    }

    try {
      await axios.put(
        `/api/administradores/${id}`,
        {
          nombre_completo: formData.nombre_completo,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('Administrador actualizado correctamente');
      setTimeout(() => {
        navigate('/administrators');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar administrador');
    }
  };

  if (loading) {
    return <Typography sx={{ p: 3 }}>Cargando administrador...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Editar Administrador
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
            label="Contraseña (dejar vacío para no cambiar)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/administrators')}>
              Volver
            </Button>
            <Button type="submit" variant="contained">
              Guardar cambios
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default EditAdministrator;
