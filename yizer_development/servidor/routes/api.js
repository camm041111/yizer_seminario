const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin, requireAdminOrOwnCliente } = require('../middleware/auth');
const { singleImagenProducto } = require('../multer.config');
const auth = require('../controllers/authController');
const administradores = require('../controllers/administradoresController');
const clientes = require('../controllers/clientesController');
const productos = require('../controllers/productosController');
const variantes = require('../controllers/variantesController');
const personalizaciones = require('../controllers/personalizacionesController');
const pedidos = require('../controllers/pedidosController');
const catalogo = require('../controllers/catalogoController');

router.get('/catalogo', catalogo.catalogo);

router.post('/auth/login/admin', auth.loginAdmin);
router.post('/auth/login/cliente', auth.loginCliente);
router.post('/auth/registro', auth.registroCliente);

router.get('/administradores', requireAuth, requireAdmin, administradores.listar);
router.get('/administradores/:id', requireAuth, requireAdmin, administradores.obtenerPorId);
router.post('/administradores', requireAuth, requireAdmin, administradores.crear);
router.put('/administradores/:id', requireAuth, requireAdmin, administradores.actualizar);
router.delete('/administradores/:id', requireAuth, requireAdmin, administradores.eliminar);

router.get('/clientes', requireAuth, requireAdmin, clientes.listar);
router.get('/clientes/:id', requireAuth, requireAdminOrOwnCliente, clientes.obtenerPorId);
router.post('/clientes', requireAuth, requireAdmin, clientes.crear);
router.put('/clientes/:id', requireAuth, requireAdminOrOwnCliente, clientes.actualizar);
router.delete('/clientes/:id', requireAuth, requireAdmin, clientes.eliminar);

router.get('/productos', productos.listar);
router.get('/productos/:id', productos.obtenerPorId);
router.post('/productos', requireAuth, requireAdmin, productos.crear);
router.post(
  '/productos/:id/imagen',
  requireAuth,
  requireAdmin,
  singleImagenProducto,
  productos.subirImagen
);
router.delete('/productos/:id/imagen', requireAuth, requireAdmin, productos.eliminarImagen);
router.put('/productos/:id', requireAuth, requireAdmin, productos.actualizar);
router.delete('/productos/:id', requireAuth, requireAdmin, productos.eliminar);

router.get('/productos/:idProducto/variantes', variantes.listarPorProducto);
router.post('/productos/:idProducto/variantes', requireAuth, requireAdmin, variantes.crear);
router.get('/variantes/:id', variantes.obtenerPorId);
router.put('/variantes/:id', requireAuth, requireAdmin, variantes.actualizar);
router.delete('/variantes/:id', requireAuth, requireAdmin, variantes.eliminar);

router.get('/personalizaciones', requireAuth, personalizaciones.listar);
router.get('/personalizaciones/:id', requireAuth, personalizaciones.obtenerPorId);
router.post('/personalizaciones', requireAuth, personalizaciones.crear);
router.put('/personalizaciones/:id', requireAuth, personalizaciones.actualizar);
router.delete('/personalizaciones/:id', requireAuth, personalizaciones.eliminar);

router.get('/pedidos', requireAuth, pedidos.listar);
router.get('/pedidos/:id', requireAuth, pedidos.obtenerPorId);
router.post('/pedidos', requireAuth, pedidos.crear);
router.put('/pedidos/:id', requireAuth, pedidos.actualizar);
router.delete('/pedidos/:id', requireAuth, pedidos.eliminar);
router.post('/pedidos/:idPedido/detalles', requireAuth, pedidos.agregarDetalle);
router.put('/pedidos/detalles/:idDetalle', requireAuth, pedidos.actualizarDetalle);
router.delete('/pedidos/detalles/:idDetalle', requireAuth, pedidos.eliminarDetalle);

module.exports = router;
