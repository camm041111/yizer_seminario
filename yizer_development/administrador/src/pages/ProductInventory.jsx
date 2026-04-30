import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Alert, Chip, InputAdornment } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function getImageUrl(url) {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  const baseUrl = axios.defaults.baseURL || '';
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

const ProductInventory = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/productos', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setProducts(response.data);
        setError('');
      } catch {
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((product) => product.id !== id));
    } catch {
      setError('Error al eliminar producto');
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter((product) =>
    (product.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(product.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (precio) => {
    if (precio == null || precio === '') return '0.00';
    const value = Number(precio);
    return Number.isNaN(value) ? String(precio) : value.toFixed(2);
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h4">Productos</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Inventario, precios y estado de venta.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/products/new')}>
          Nuevo producto
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar producto..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2, width: '100%', maxWidth: 420 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Cargando...</TableCell>
              </TableRow>
            ) : filteredProducts.length ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    {product.imagen_url ? (
                      <Box
                        component="img"
                        src={getImageUrl(product.imagen_url)}
                        alt={product.nombre}
                        sx={{
                          width: 58,
                          height: 58,
                          objectFit: 'cover',
                          borderRadius: 1.5,
                          border: '1px solid rgba(139, 30, 36, 0.16)',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        Sin imagen
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>{product.descripcion || '-'}</TableCell>
                  <TableCell>${formatPrice(product.precio)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={product.activo ? 'success' : 'default'}
                      label={product.activo ? 'Activo' : 'Inactivo'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/products/${product.id}/edit`)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(product.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>No hay productos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductInventory;
