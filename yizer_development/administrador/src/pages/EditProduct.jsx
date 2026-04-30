import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, FormControlLabel, Switch, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function getImageUrl(url) {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  const baseUrl = axios.defaults.baseURL || '';
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
        setImageUrl(response.data.imagen_url || '');
        setError('');
      } catch {
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

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
      return file ? URL.createObjectURL(file) : '';
    });
  };

  const handleRemoveImage = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/productos/${id}/imagen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImageUrl('');
      setImageFile(null);
      setImagePreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return '';
      });
      setSuccess('Imagen eliminada correctamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar imagen');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre || !formData.precio) {
      setError('Nombre y precio son obligatorios');
      return;
    }

    setSaving(true);
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
      if (imageFile) {
        const imageData = new FormData();
        imageData.append('imagen', imageFile);
        const response = await axios.post(`/api/productos/${id}/imagen`, imageData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setImageUrl(response.data.imagen_url || '');
      }
      setSuccess('Producto actualizado correctamente');
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography sx={{ p: 3 }}>Cargando producto...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4">
          Editar producto
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Actualiza la información visible en el inventario.
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
            {(imagePreview || imageUrl) && (
              <Box
                component="img"
                src={imagePreview || getImageUrl(imageUrl)}
                alt="Imagen actual del producto"
                sx={{
                  display: 'block',
                  mb: 2,
                  width: 180,
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid rgba(139, 30, 36, 0.18)',
                }}
              />
            )}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button variant="outlined" component="label">
                {imageUrl || imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {imageUrl && (
                <Button type="button" color="error" onClick={handleRemoveImage}>
                  Quitar imagen
                </Button>
              )}
            </Box>
            {imageFile && (
              <Typography color="text.secondary" sx={{ mt: 1, fontSize: '0.9rem' }}>
                {imageFile.name}
              </Typography>
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/products')}>
              Volver
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EditProduct;
