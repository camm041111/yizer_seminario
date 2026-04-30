import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const DataTable = ({ title, columns, apiEndpoint, onEdit, onAdd }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/${apiEndpoint}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      try {
        await axios.delete(`/api/${apiEndpoint}/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
          Agregar
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.key === 'imagen_url' && row[col.key] ? (
                      <img
                        src={row[col.key]}
                        alt="Imagen"
                        style={{ maxHeight: 60, maxWidth: 100, objectFit: 'cover' }}
                      />
                    ) : row[col.key] != null ? (
                      row[col.key].toString()
                    ) : (
                      ''
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton onClick={() => onEdit(row)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataTable;
