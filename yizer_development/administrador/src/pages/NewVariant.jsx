import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography, TextField, Button, MenuItem, Checkbox, FormControlLabel, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewVariant = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_producto: '',
    color: '',
    talla: '',
    stock: 0,
    activo: true,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/productos');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

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
      await axios.post(`/api/productos/${formData.id_producto}/variantes`, {
        color: formData.color,
        talla: formData.talla,
        stock: formData.stock,
        activo: formData.activo,
      });
      navigate('/variants');
    } catch (err) {
      console.error('Error creating variant:', err);
      setError('Error creating variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4">
          Nueva variante
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Define color, talla y stock para un producto.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          select
          label="Product"
          name="id_producto"
          value={formData.id_producto}
          onChange={handleChange}
          required
        >
          {products.map((product) => (
            <MenuItem key={product.id} value={product.id}>
              {product.nombre}
            </MenuItem>
          ))}
        </TextField>
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
            {loading ? 'Guardando...' : 'Guardar variante'}
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

export default NewVariant;
