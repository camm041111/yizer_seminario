import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const emptyCustomer = {
  nombre_completo: '',
  email: '',
  telefono: '',
  password: '',
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(emptyCustomer);
  const { token } = useAuth();

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/clientes', authHeaders);
      setCustomers(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setFormData(emptyCustomer);
    setError('');
    setDialogOpen(true);
  };

  const openEditDialog = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      nombre_completo: customer.nombre_completo || '',
      email: customer.email || '',
      telefono: customer.telefono || '',
      password: '',
    });
    setError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingCustomer(null);
    setFormData(emptyCustomer);
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono || null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingCustomer) {
        await axios.put(`/api/clientes/${editingCustomer.id_cliente}`, payload, authHeaders);
      } else {
        await axios.post('/api/clientes', { ...payload, password: formData.password }, authHeaders);
      }

      closeDialog();
      await fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`¿Eliminar al cliente ${customer.nombre_completo}?`)) return;

    try {
      await axios.delete(`/api/clientes/${customer.id_cliente}`, authHeaders);
      setCustomers((current) => current.filter((item) => item.id_cliente !== customer.id_cliente));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar cliente');
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      String(customer.id_cliente).includes(query) ||
      (customer.nombre_completo || '').toLowerCase().includes(query) ||
      (customer.email || '').toLowerCase().includes(query) ||
      (customer.telefono || '').toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h4">Clientes</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Consulta y administra los clientes registrados.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Nuevo cliente
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Buscar por nombre, email o teléfono..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, width: '100%', maxWidth: 440 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre completo</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Fecha registro</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Cargando...</TableCell>
              </TableRow>
            ) : filteredCustomers.length ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id_cliente}>
                  <TableCell>{customer.id_cliente}</TableCell>
                  <TableCell>{customer.nombre_completo}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.telefono || '-'}</TableCell>
                  <TableCell>{new Date(customer.fecha_registro).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => openEditDialog(customer)}>
                        Editar
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(customer)}>
                        Eliminar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                  No hay clientes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingCustomer ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre completo"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label={editingCustomer ? 'Nueva contraseña' : 'Contraseña'}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!editingCustomer}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Customers;
