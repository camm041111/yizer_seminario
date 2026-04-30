import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, MenuItem, TextField } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Variants = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    product: '',
    size: '',
    color: '',
  });
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await axios.get('/api/variantes');
        setVariants(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching variants:', error);
        setLoading(false);
      }
    };
    fetchVariants();
  }, []);

  const filteredVariants = variants.filter(variant => {
    return (
      (filters.product === '' || variant.id_producto.toString() === filters.product) &&
      (filters.size === '' || variant.talla === filters.size) &&
      (filters.color === '' || variant.color === filters.color)
    );
  });

  const uniqueColors = [...new Set(variants.map(v => v.color))];
  const uniqueSizes = [...new Set(variants.map(v => v.talla))];
  const uniqueProducts = [...new Set(variants.map(v => ({ id: v.id_producto, name: v.producto_nombre })))].map(p => ({ value: p.id.toString(), label: p.name }));

  const stats = [
    { label: 'Variantes totales', value: variants.length.toString(), color: '#241316' },
    { label: 'Colores únicos', value: uniqueColors.length.toString(), color: '#241316' },
    { label: 'Sin stock', value: variants.filter(v => v.stock === 0).length.toString(), color: '#d71920' },
  ];

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/variantes/${id}`);
      setVariants(variants.filter(v => v.id_variante !== id));
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  if (loading) return <Typography>Cargando variantes...</Typography>;

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography
              component="a"
              href="/products"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#74565b',
                textDecoration: 'none',
                '&:hover': { color: '#d71920' },
              }}
            >
              Productos
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: '#74565b' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#a70f16' }}>
              Variantes
            </Typography>
          </Box>
          <Typography variant="h4">Variantes</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Control de tallas, colores y existencias por producto.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/variants/new')}
        >
          Nueva variante
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            sx={{
              p: 3,
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#74565b', mb: 1, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </Typography>
            <Typography
              sx={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: stat.color,
                letterSpacing: '-0.025em',
              }}
            >
              {stat.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Main Content Card */}
      <Paper sx={{ overflow: 'hidden' }}>
        {/* Filter Bar */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid rgba(139, 30, 36, 0.12)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Product"
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              sx={{
                minWidth: 200,
              }}
            >
              <MenuItem value="">Todos los productos</MenuItem>
              {uniqueProducts.map((product) => (
                <MenuItem key={product.value} value={product.value}>
                  {product.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Size"
              value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              sx={{
                minWidth: 120,
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {uniqueSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Color"
              value={filters.color}
              onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              sx={{
                minWidth: 140,
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {uniqueColors.map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </TextField>
          </Box>

        </Box>

        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(139, 30, 36, 0.12)', background: '#fff0f0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#6f1d24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ID
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#6f1d24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Producto
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#6f1d24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Color
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#6f1d24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Talla
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#6f1d24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Stock
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 800, color: '#6f1d24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((variant) => (
                <tr
                  key={variant.id_variante}
                  style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.2)' }}
                >
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#74565b', fontWeight: 700 }}>
                    {variant.id_variante}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#241316' }}>
                      {variant.producto_nombre}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#241316' }}>
                      {variant.color}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#241316' }}>
                      {variant.talla}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: variant.stock === 0 ? '#d71920' : '#241316',
                      }}
                    >
                      {variant.stock === 0 ? 'Sin stock' : `${variant.stock} unidades`}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <IconButton size="small" sx={{ color: '#a70f16', mr: 1 }} onClick={() => navigate(`/variants/${variant.id_variante}/edit`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(variant.id_variante)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default Variants;
