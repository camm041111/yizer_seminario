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
    { label: 'Total Variants', value: variants.length.toString(), color: '#131b2e' },
    { label: 'Unique Colors', value: uniqueColors.length.toString(), color: '#131b2e' },
    { label: 'Out of Stock', value: variants.filter(v => v.stock === 0).length.toString(), color: '#ba1a1a' },
  ];

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/variantes/${id}`);
      setVariants(variants.filter(v => v.id_variante !== id));
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <Typography
          component="a"
          href="/products"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#534341',
            textDecoration: 'none',
            '&:hover': { color: '#dc2626' },
          }}
        >
          Products
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 14, color: '#534341' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#131b2e' }}>
          Variants
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            sx={{
              p: 3,
              borderRadius: '0.75rem',
              border: '1px solid rgba(216, 194, 191, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#534341', mb: 1 }}>
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
      <Paper sx={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(216, 194, 191, 0.3)' }}>
        {/* Filter Bar */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid rgba(216, 194, 191, 0.3)',
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
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '0.5rem',
                },
              }}
            >
              <MenuItem value="">All Products</MenuItem>
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
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '0.5rem',
                },
              }}
            >
              <MenuItem value="">All Sizes</MenuItem>
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
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '0.5rem',
                },
              }}
            >
              <MenuItem value="">All Colors</MenuItem>
              {uniqueColors.map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#dc2626',
              fontWeight: 600,
              '&:hover': { bgcolor: '#dc2626', opacity: 0.9 },
            }}
            onClick={() => navigate('/variants/new')}
          >
            Add Variant
          </Button>
        </Box>

        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.3)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  ID
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Product
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Color
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Size
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Stock
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#534341', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((variant) => (
                <tr
                  key={variant.id_variante}
                  style={{ borderBottom: '1px solid rgba(216, 194, 191, 0.2)' }}
                >
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#534341', fontWeight: 600 }}>
                    {variant.id_variante}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#131b2e' }}>
                      {variant.producto_nombre}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#131b2e' }}>
                      {variant.color}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#131b2e' }}>
                      {variant.talla}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: variant.stock === 0 ? '#ba1a1a' : '#131b2e',
                      }}
                    >
                      {variant.stock === 0 ? 'Out of Stock' : `${variant.stock} units`}
                    </Typography>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <IconButton size="small" sx={{ color: '#534341', mr: 1 }} onClick={() => navigate(`/variants/${variant.id_variante}/edit`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#534341' }} onClick={() => handleDelete(variant.id_variante)}>
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
