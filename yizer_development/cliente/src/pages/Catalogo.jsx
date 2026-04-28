// Vista de Catalogo - Catálogo público de productos
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../config/api';

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados de datos
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Carrito de compras
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Cargar catálogo al iniciar
  useEffect(() => {
    cargarCatalogo();
  }, []);

  // Cargar producto seleccionado desde URL
  useEffect(() => {
    const idProducto = searchParams.get('producto');
    if (idProducto && productos.length > 0) {
      const prod = productos.find(p => p.id_producto === parseInt(idProducto));
      if (prod) setProductoSeleccionado(prod);
    }
  }, [searchParams, productos]);

  // Función para cargar el catálogo
  async function cargarCatalogo() {
    try {
      setLoading(true);
      const data = await api.get('/catalogo');
      setProductos(data.productos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.tipo_tela?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para ver detalles de un producto
  function verDetalles(producto) {
    setProductoSeleccionado(producto);
    setSearchParams({ producto: producto.id_producto });
  }

  // Función para cerrar modal de detalles
  function cerrarDetalles() {
    setProductoSeleccionado(null);
    setSearchParams({});
  }

  // Función para agregar al carrito
  function agregarAlCarrito(producto, variante, cantidad = 1) {
    const item = {
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      id_variante: variante.id_variante,
      color: variante.color,
      talla: variante.talla,
      precio: producto.precio_base,
      cantidad
    };
    
    setCarrito(prev => {
      // Verificar si ya existe
      const existente = prev.find(i => 
        i.id_variante === variante.id_variante
      );
      
      if (existente) {
        return prev.map(i => 
          i.id_variante === variante.id_variante
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      
      return [...prev, item];
    });
  }

  // Función para actualizar cantidad en carrito
  function actualizarCantidad(idVariante, nuevaCantidad) {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(idVariante);
      return;
    }
    
    setCarrito(prev => prev.map(item => 
      item.id_variante === idVariante
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  }

  // Función para eliminar del carrito
  function eliminarDelCarrito(idVariante) {
    setCarrito(prev => prev.filter(item => item.id_variante !== idVariante));
  }

  // Función para obtener total del carrito
  function getTotalCarrito() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  // Función para realizar pedido
  async function realizarPedido() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para realizar un pedido');
      return;
    }

    try {
      const detalles = carrito.map(item => ({
        id_variante: item.id_variante,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }));

      await api.post('/pedidos', {
        detalles
      }, token);

      alert('Pedido realizado con éxito');
      setCarrito([]);
      setMostrarCarrito(false);
    } catch (err) {
      alert('Error al realizar pedido: ' + err.message);
    }
  }

  return (
    <div>
      {/* Navegación */}
      <nav>
        <div>
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/login">Login</Link>
        </div>
        <div>
          <button onClick={() => setMostrarCarrito(!mostrarCarrito)}>
            Carrito ({carrito.length})
          </button>
        </div>
      </nav>

      <h1>Catálogo de Productos</h1>

      {/* Buscador */}
      <div>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Estados de carga/error */}
      {loading && <p>Cargando catálogo...</p>}
      {error && <p>Error: {error}</p>}

      {/* Grid de productos */}
      {!loading && !error && (
        <div>
          <h2>Productos ({productosFiltrados.length})</h2>
          
          {productosFiltrados.length === 0 ? (
            <p>No se encontraron productos</p>
          ) : (
            <div>
              {productosFiltrados.map(producto => (
                <div key={producto.id_producto}>
                  <img 
                    src={producto.imagen_absoluta || producto.imagen_url} 
                    alt={producto.nombre} 
                  />
                  <h3>{producto.nombre}</h3>
                  <p>Tipo: {producto.tipo_tela}</p>
                  <p>Precio: ${producto.precio_base}</p>
                  <p>Variantes disponibles: {producto.variantes?.length || 0}</p>
                  <button onClick={() => verDetalles(producto)}>
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles del producto */}
      {productoSeleccionado && (
        <div>
          <div>
            <button onClick={cerrarDetalles}>Cerrar</button>
          </div>
          
          <h2>{productoSeleccionado.nombre}</h2>
          <img 
            src={productoSeleccionado.imagen_absoluta || productoSeleccionado.imagen_url} 
            alt={productoSeleccionado.nombre} 
          />
          <p>Tipo de tela: {productoSeleccionado.tipo_tela}</p>
          <p>Precio base: ${productoSeleccionado.precio_base}</p>
          
          <h3>Variantes disponibles</h3>
          {productoSeleccionado.variantes?.length > 0 ? (
            <div>
              {productoSeleccionado.variantes.map(variante => (
                <div key={variante.id_variante}>
                  <p>Color: {variante.color}</p>
                  <p>Talla: {variante.talla}</p>
                  <p>Stock: {variante.stock}</p>
                  {variante.stock > 0 ? (
                    <button onClick={() => agregarAlCarrito(productoSeleccionado, variante, 1)}>
                      Agregar al carrito
                    </button>
                  ) : (
                    <span>Sin stock</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No hay variantes disponibles</p>
          )}
        </div>
      )}

      {/* Carrito de compras */}
      {mostrarCarrito && (
        <div>
          <h2>Carrito de Compras</h2>
          
          {carrito.length === 0 ? (
            <p>El carrito está vacío</p>
          ) : (
            <div>
              {carrito.map(item => (
                <div key={item.id_variante}>
                  <p>{item.nombre} - {item.color} / {item.talla}</p>
                  <p>Precio: ${item.precio} x {item.cantidad} = ${item.precio * item.cantidad}</p>
                  <button onClick={() => actualizarCantidad(item.id_variante, item.cantidad - 1)}>-</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => actualizarCantidad(item.id_variante, item.cantidad + 1)}>+</button>
                  <button onClick={() => eliminarDelCarrito(item.id_variante)}>Eliminar</button>
                </div>
              ))}
              
              <h3>Total: ${getTotalCarrito()}</h3>
              <button onClick={realizarPedido}>Realizar Pedido</button>
            </div>
          )}
          
          <button onClick={() => setMostrarCarrito(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}