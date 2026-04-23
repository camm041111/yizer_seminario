import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

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
    } catch (err) {
      setError('Error al eliminar administrador');
    }
  };

  const filteredAdministrators = administrators.filter(admin =>
    admin.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Administradores</Typography>
        <Button
          variant="contained"
          color="primary"
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
        sx={{ mb: 3, width: '100%', maxWidth: 400 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
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
