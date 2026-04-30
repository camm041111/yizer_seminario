import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  Note as NoteIcon,
  Payment as PaymentIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

function getAssetUrl(url) {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  const baseUrl = axios.defaults.baseURL || '';
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return Number.isNaN(number) ? '$0.00' : `$${number.toFixed(2)}`;
}

function obtenerTransformacion(posicion) {
  if (typeof posicion === 'string') {
    const match = posicion.match(/x:([\d.]+),y:([\d.]+)(?:,s:([\d.]+))?(?:,r:([-.\d]+))?/);
    if (match) {
      return {
        x: Number(match[1]),
        y: Number(match[2]),
        escala: Number(match[3] || 100),
        rotacion: Number(match[4] || 0),
      };
    }
  }
  return { x: 50, y: 34, escala: 100, rotacion: 0 };
}

function CustomizationPreview({ item }) {
  const productoImagen = getAssetUrl(item.producto_imagen_url);
  const personalizacionImagen = getAssetUrl(item.personalizacion_url);
  const vistaPrevia = getAssetUrl(item.personalizacion_vista_previa_url);
  const mostrarTexto = item.personalizacion_tipo !== 'imagen' && item.personalizacion_texto;
  const mostrarImagen = item.personalizacion_tipo !== 'texto' && personalizacionImagen;
  const tienePersonalizacion = item.personalizacion_tipo && (mostrarTexto || mostrarImagen);
  const posicion = obtenerTransformacion(item.personalizacion_posicion);

  return (
    <Box sx={{ width: { xs: '100%', sm: 210 }, flexShrink: 0 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#fff',
          border: '1px solid rgba(139, 30, 36, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {vistaPrevia ? (
          <Box
            component="img"
            src={vistaPrevia}
            alt={`Vista personalizada de ${item.producto_nombre}`}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : productoImagen ? (
          <Box
            component="img"
            src={productoImagen}
            alt={item.producto_nombre}
            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1.5 }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, textAlign: 'center' }}>
            Sin imagen de producto
          </Typography>
        )}

        {!vistaPrevia && tienePersonalizacion ? (
          <Box
            sx={{
              position: 'absolute',
              left: `${posicion.x}%`,
              top: `${posicion.y}%`,
              transform: `translate(-50%, -50%) rotate(${posicion.rotacion}deg) scale(${posicion.escala / 100})`,
              transformOrigin: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              maxWidth: '54%',
              pointerEvents: 'none',
            }}
          >
            {mostrarImagen && (
              <Box
                component="img"
                src={personalizacionImagen}
                alt="Imagen personalizada"
                sx={{
                  maxWidth: 92,
                  maxHeight: 92,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
                }}
              />
            )}
            {mostrarTexto && (
              <Typography
                sx={{
                  color: item.personalizacion_color || '#111111',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  lineHeight: 1.1,
                  textAlign: 'center',
                  overflowWrap: 'anywhere',
                  textShadow: '0 1px 2px rgba(255,255,255,0.85)',
                }}
              >
                {item.personalizacion_texto}
              </Typography>
            )}
          </Box>
        ) : !vistaPrevia ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              p: 1,
            }}
          >
            <Chip size="small" label="Sin personalización" />
          </Box>
        ) : null}
      </Box>
      {tienePersonalizacion && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
          {vistaPrevia
            ? 'Vista exacta guardada al confirmar el pedido'
            : `Posición ${posicion.x.toFixed(0)}%, ${posicion.y.toFixed(0)}% · Tamaño ${posicion.escala}%`}
        </Typography>
      )}
    </Box>
  );
}

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const orderResponse = await axios.get(`/api/pedidos/${id}`, authHeaders);
      setOrder(orderResponse.data);

      const customerResponse = await axios.get(`/api/clientes/${orderResponse.data.id_cliente}`, authHeaders);
      setCustomer(customerResponse.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleEstadoChange = async (estado) => {
    try {
      const response = await axios.put(`/api/pedidos/${id}`, { estado }, authHeaders);
      setOrder(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar pedido');
    }
  };

  if (loading) return <Typography>Cargando pedido...</Typography>;

  if (error && !order) {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')}>
          Volver a pedidos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/orders')} sx={{ mb: 3 }}>
        Volver a pedidos
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#2e1313' }}>
              Pedido #{order.id_pedido}
            </Typography>
            <Chip color={estadoColors[order.estado]} label={estadoLabels[order.estado] || order.estado} />
          </Box>
          <Typography color="text.secondary">
            {new Date(order.fecha_pedido).toLocaleString()}
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            label="Estado"
            value={order.estado}
            onChange={(event) => handleEstadoChange(event.target.value)}
          >
            {estados.map((estado) => (
              <MenuItem key={estado} value={estado}>{estadoLabels[estado]}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShippingIcon color="primary" />
              Cliente y envío
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{customer?.nombre_completo || `Cliente #${order.id_cliente}`}</Typography>
                <Typography color="text.secondary">{customer?.email || '-'}</Typography>
                <Typography color="text.secondary">{customer?.telefono || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Dirección</Typography>
                <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {order.direccion_envio || 'Sin dirección registrada'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="primary" />
              Productos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {order.detalles?.length ? order.detalles.map((item) => (
                <Box
                  key={item.id_detalle}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    p: 2,
                    bgcolor: '#fff7f7',
                    borderRadius: 2,
                    border: '1px solid rgba(139, 30, 36, 0.1)',
                  }}
                >
                  <CustomizationPreview item={item} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{item.producto_nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.producto_tipo_tela || 'Sin tela'} · {item.color} / {item.talla}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.cantidad} x {formatCurrency(item.precio_unitario)}
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>{formatCurrency(item.subtotal)}</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    {item.personalizacion_tipo ? (
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Personalización: {item.personalizacion_tipo}
                        </Typography>
                        {item.personalizacion_texto && (
                          <Typography variant="body2" color="text.secondary">
                            Texto: {item.personalizacion_texto}
                          </Typography>
                        )}
                        {item.personalizacion_url && (
                          <Typography
                            component="a"
                            href={getAssetUrl(item.personalizacion_url)}
                            target="_blank"
                            rel="noreferrer"
                            variant="body2"
                            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
                          >
                            Abrir imagen personalizada
                          </Typography>
                        )}
                        {item.personalizacion_vista_previa_url && (
                          <Typography
                            component="a"
                            href={getAssetUrl(item.personalizacion_vista_previa_url)}
                            target="_blank"
                            rel="noreferrer"
                            variant="body2"
                            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
                          >
                            Abrir vista exacta del pedido
                          </Typography>
                        )}
                        {item.personalizacion_color && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                bgcolor: item.personalizacion_color,
                                border: '1px solid rgba(0,0,0,0.16)',
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Color {item.personalizacion_color}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Este producto no tiene personalización.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )) : (
                <Typography color="text.secondary">Este pedido no tiene detalles.</Typography>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <NoteIcon color="primary" />
              Notas
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {order.notas || 'Sin notas'}
            </Typography>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 2, alignSelf: 'start' }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            Resumen
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Artículos</Typography>
            <Typography>{order.detalles?.reduce((sum, item) => sum + Number(item.cantidad || 0), 0) || 0}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 700 }}>Total</Typography>
            <Typography sx={{ fontWeight: 800, color: '#dc2626', fontSize: '1.25rem' }}>
              {formatCurrency(order.total)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default OrderDetails;
