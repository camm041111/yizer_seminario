import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Alert, FormControlLabel, Switch, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function getPreviewUrl(file) {
  return file ? URL.createObjectURL(file) : '';
}

const AddNewProduct = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    activo: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return getPreviewUrl(file);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre || !formData.precio) {
      setError('Nombre y precio son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        '/api/productos',
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
      if (imageFile) {
        const imageData = new FormData();
        imageData.append('imagen', imageFile);
        await axios.post(`/api/productos/${response.data.id}/imagen`, imageData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setSuccess('Producto creado correctamente');
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4">
          Nuevo producto
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Crea un producto base para el catálogo.
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

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Imagen de la playera
            </Typography>
            <Button variant="outlined" component="label">
              Seleccionar imagen
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imageFile && (
              <Typography color="text.secondary" sx={{ mt: 1, fontSize: '0.9rem' }}>
                {imageFile.name}
              </Typography>
            )}
            {imagePreview && (
              <Box
                component="img"
                src={imagePreview}
                alt="Vista previa del producto"
                sx={{
                  display: 'block',
                  mt: 2,
                  width: 160,
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid rgba(139, 30, 36, 0.18)',
                }}
              />
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/products')}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddNewProduct;
