import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, FormControlLabel, Switch } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    activo: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/productos/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setFormData({
          nombre: response.data.nombre || '',
          descripcion: response.data.descripcion || '',
          precio: response.data.precio?.toString() || '',
          activo: response.data.activo ?? true,
        });
        setError('');
      } catch (err) {
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre || !formData.precio) {
      setError('Nombre y precio son obligatorios');
      return;
    }

    try {
      await axios.put(
        `/api/productos/${id}`,
        {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: Number(formData.precio),
          activo: formData.activo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('Producto actualizado correctamente');
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar producto');
    }
  };

  if (loading) {
    return <Typography sx={{ p: 3 }}>Cargando producto...</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Editar producto
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="nombre"
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <TextField
            name="descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            multiline
            rows={4}
          />

          <TextField
            name="precio"
            label="Precio"
            type="number"
            value={formData.precio}
            onChange={handleChange}
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.activo}
                onChange={handleChange}
                name="activo"
              />
            }
            label="Activo"
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/products')}>
              Volver
            </Button>
            <Button type="submit" variant="contained">
              Guardar
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default EditProduct;
