import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography, TextField, Button, Checkbox, FormControlLabel, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditVariant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    color: '',
    talla: '',
    stock: 0,
    activo: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        const response = await axios.get(`/api/variantes/${id}`);
        setFormData({
          color: response.data.color || '',
          talla: response.data.talla || '',
          stock: response.data.stock || 0,
          activo: response.data.activo || true,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching variant:', error);
        setError('Error fetching variant');
        setLoading(false);
      }
    };
    fetchVariant();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.put(`/api/variantes/${id}`, formData);
      navigate('/variants');
    } catch (error) {
      console.error('Error updating variant:', error);
      setError('Error updating variant');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Cargando variante...</Typography>;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4">
          Editar variante
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Actualiza color, talla, stock y disponibilidad.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          required
        />
        <TextField
          label="Talla"
          name="talla"
          value={formData.talla}
          onChange={handleChange}
          required
        />
        <TextField
          label="Stock"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.activo}
              onChange={handleChange}
              name="activo"
            />
          }
          label="Activo"
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/variants')}>
            Cancelar
          </Button>
        </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditVariant;
