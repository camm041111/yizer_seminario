import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Alert, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

const Administrators = () => {
  const [administrators, setAdministrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdministrators();
  }, [token]);

  const fetchAdministrators = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/administradores', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdministrators(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar administradores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este administrador?')) return;

    try {
      await axios.delete(`/api/administradores/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdministrators(administrators.filter(admin => admin.id_admin !== id));
    } catch {
      setError('Error al eliminar administrador');
    }
  };

  const filteredAdministrators = administrators.filter(admin =>
    admin.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h4">Administradores</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de usuarios con acceso al panel.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/administrators/new')}
        >
          Nuevo Administrador
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        placeholder="Buscar por nombre o email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, width: '100%', maxWidth: 400 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAdministrators.length > 0 ? (
              filteredAdministrators.map((admin) => (
                <TableRow key={admin.id_admin}>
                  <TableCell>{admin.id_admin}</TableCell>
                  <TableCell>{admin.nombre_completo}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.telefono || '-'}</TableCell>
                  <TableCell>{new Date(admin.fecha_registro).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/administrators/${admin.id_admin}/edit`)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(admin.id_admin)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                  No hay administradores
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Administrators;
