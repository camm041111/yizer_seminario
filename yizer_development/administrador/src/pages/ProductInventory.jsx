import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

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
      } catch (err) {
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
    } catch (err) {
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Productos</Typography>
        <Button variant="contained" onClick={() => navigate('/products/new')}>
          Nuevo producto
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar producto..."
        sx={{ mb: 2, width: '100%', maxWidth: 400 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
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
                <TableCell colSpan={6}>Cargando...</TableCell>
              </TableRow>
            ) : filteredProducts.length ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>{product.descripcion || '-'}</TableCell>
                  <TableCell>${formatPrice(product.precio)}</TableCell>
                  <TableCell>{product.activo ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/products/${product.id}/edit`)}>
                      Editar
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(product.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>No hay productos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductInventory;
