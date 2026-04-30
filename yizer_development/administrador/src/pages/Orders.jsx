import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon, Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const estados = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado'];

const estadoLabels = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const estadoColors = {
  pendiente: 'warning',
  en_proceso: 'info',
  enviado: 'primary',
  entregado: 'success',
  cancelado: 'error',
};

function formatCurrency(value) {
  const number = Number(value || 0);
  return Number.isNaN(number) ? '$0.00' : `$${number.toFixed(2)}`;
}

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersResponse, customersResponse] = await Promise.all([
        axios.get('/api/pedidos', authHeaders),
        axios.get('/api/clientes', authHeaders),
      ]);
      setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
      setCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const customerById = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.id_cliente] = customer;
      return acc;
    }, {});
  }, [customers]);

  const handleEstadoChange = async (order, estado) => {
    try {
      const response = await axios.put(`/api/pedidos/${order.id_pedido}`, { estado }, authHeaders);
      setOrders((current) => current.map((item) => (
        item.id_pedido === order.id_pedido ? response.data : item
      )));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar pedido');
    }
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`¿Eliminar el pedido #${order.id_pedido}?`)) return;

    try {
      await axios.delete(`/api/pedidos/${order.id_pedido}`, authHeaders);
      setOrders((current) => current.filter((item) => item.id_pedido !== order.id_pedido));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar pedido');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const customer = customerById[order.id_cliente];
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      String(order.id_pedido).includes(query) ||
      String(order.id_cliente).includes(query) ||
      (customer?.nombre_completo || '').toLowerCase().includes(query) ||
      (customer?.email || '').toLowerCase().includes(query)
    );
    const matchesEstado = !estadoFilter || order.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h4">Pedidos</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Seguimiento de estados, totales y envíos.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
          Actualizar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Buscar por pedido, cliente o email..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{ width: '100%', maxWidth: 420 }}
        />
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            label="Estado"
            value={estadoFilter}
            onChange={(event) => setEstadoFilter(event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {estados.map((estado) => (
              <MenuItem key={estado} value={estado}>{estadoLabels[estado]}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Cargando...</TableCell>
              </TableRow>
            ) : filteredOrders.length ? (
              filteredOrders.map((order) => {
                const customer = customerById[order.id_cliente];
                return (
                  <TableRow key={order.id_pedido}>
                    <TableCell>#{order.id_pedido}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {customer?.nombre_completo || `Cliente #${order.id_cliente}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer?.email || 'Sin email disponible'}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(order.fecha_pedido).toLocaleString()}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={order.estado}
                          onChange={(event) => handleEstadoChange(order, event.target.value)}
                          renderValue={(value) => (
                            <Chip size="small" color={estadoColors[value]} label={estadoLabels[value] || value} />
                          )}
                        >
                          {estados.map((estado) => (
                            <MenuItem key={estado} value={estado}>{estadoLabels[estado]}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography variant="body2" noWrap title={order.direccion_envio || ''}>
                        {order.direccion_envio || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/orders/${order.id_pedido}`)}
                        >
                          Ver
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(order)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                  No hay pedidos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders;
