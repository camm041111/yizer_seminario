// Vista de Productos - Gestión de productos (Admin) y visualización (Cliente)
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';

export default function Productos() {
  const navigate = useNavigate();
  
  // Estados de datos
  const [productos, setProductos] = useState([]);
  const [variantes, setVariantes] = useState({});
  const [productoEditando, setProductoEditando] = useState(null);
  const [varianteEditando, setVarianteEditando] = useState(null);
  const [usuario, setUsuario] = useState(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccion, setSeccion] = useState('lista'); // 'lista', 'crear', 'editar', 'variantes'
  const [busqueda, setBusqueda] = useState('');

  // Verificar auth y cargar datos
  useEffect(() => {
    verificarAuth();
  }, []);

  useEffect(() => {
    if (usuario) {
      if (usuario.role === 'admin') {
        cargarProductos();
      } else {
        // Cliente solo puede ver catálogo
        navigate('/catalogo');
      }
    }
  }, [usuario]);

  // Función para verificar autenticación
  async function verificarAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      user.role = role;
      setUsuario(user);
      
      if (role !== 'admin') {
        navigate('/catalogo');
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      navigate('/login');
    }
  }

  // Cargar productos
  async function cargarProductos() {
    try {
      setLoading(true);
      const data = await api.get('/productos');
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Cargar variantes de un producto
  async function cargarVariantes(idProducto) {
    try {
      const data = await api.get(`/productos/${idProducto}/variantes`);
      setVariantes(prev => ({ ...prev, [idProducto]: data }));
    } catch (err) {
      console.error(err);
    }
  }

  // Filtrar productos
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para crear producto
  async function crearProducto(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    datos.precio_base = parseFloat(datos.precio_base);
    datos.activo = datos.activo === 'on';
    
    try {
      await api.post('/productos', datos, token);
      alert('Producto creado');
      cargarProductos();
      setSeccion('lista');
      e.target.reset();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para actualizar producto
  async function actualizarProducto(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    
    if (datos.precio_base) datos.precio_base = parseFloat(datos.precio_base);
    datos.activo = datos.activo === 'on';
    
    try {
      await api.put(`/productos/${productoEditando.id}`, datos, token);
      alert('Producto actualizado');
      cargarProductos();
      setProductoEditando(null);
      setSeccion('lista');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para eliminar producto
  async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      await api.delete(`/productos/${id}`, token);
      alert('Producto eliminado');
      cargarProductos();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para crear variante
  async function crearVariante(e, idProducto) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    datos.stock = parseInt(datos.stock) || 0;
    datos.activo = datos.activo === 'on';
    
    try {
      await api.post(`/productos/${idProducto}/variantes`, datos, token);
      alert('Variante creada');
      cargarVariantes(idProducto);
      e.target.reset();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para actualizar variante
  async function actualizarVariante(e, idVariante, idProducto) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    
    if (datos.stock) datos.stock = parseInt(datos.stock);
    datos.activo = datos.activo === 'on';
    
    try {
      await api.put(`/variantes/${idVariante}`, datos, token);
      alert('Variante actualizada');
      cargarVariantes(idProducto);
      setVarianteEditando(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para eliminar variante
  async function eliminarVariante(idVariante, idProducto) {
    if (!confirm('¿Estás seguro de eliminar esta variante?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      await api.delete(`/variantes/${idVariante}`, token);
      alert('Variante eliminada');
      cargarVariantes(idProducto);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para cerrar sesión
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  }

  return (
    <div>
      {/* Header */}
      <header>
        <h1>Gestión de Productos</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </header>

      {/* Navegación */}
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/catalogo">Catálogo</Link>
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      {/* Menú */}
      <div>
        <button onClick={() => setSeccion('lista')}>Lista de Productos</button>
        <button onClick={() => { setProductoEditando(null); setSeccion('crear'); }}>
          Nuevo Producto
        </button>
      </div>

      {/* Estados de carga/error */}
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div>
          {/* Lista de productos */}
          {seccion === 'lista' && (
            <div>
              <h2>Lista de Productos</h2>
              
              {/* Buscador */}
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              {/* Tabla de productos */}
              {productosFiltrados.length === 0 ? (
                <p>No hay productos</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Tipo Tela</th>
                      <th>Precio</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map(producto => (
                      <tr key={producto.id}>
                        <td>{producto.id}</td>
                        <td>{producto.nombre}</td>
                        <td>{producto.descripcion}</td>
                        <td>${producto.precio}</td>
                        <td>{producto.activo ? 'Sí' : 'No'}</td>
                        <td>
                          <button onClick={() => { setProductoEditando(producto); setSeccion('editar'); }}>
                            Editar
                          </button>
                          <button onClick={() => eliminarProducto(producto.id)}>
                            Eliminar
                          </button>
                          <button onClick={() => { 
                            if (!variantes[producto.id]) cargarVariantes(producto.id);
                            setProductoEditando(producto);
                            setSeccion('variantes');
                          }}>
                            Variantes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Crear producto */}
          {seccion === 'crear' && (
            <div>
              <h2>Nuevo Producto</h2>
              
              <form onSubmit={crearProducto}>
                <div>
                  <label>Nombre:</label>
                  <input name="nombre" required />
                </div>
                <div>
                  <label>Tipo de tela:</label>
                  <input name="tipo_tela" />
                </div>
                <div>
                  <label>Precio base:</label>
                  <input name="precio_base" type="number" step="0.01" required />
                </div>
                <div>
                  <label>
                    <input name="activo" type="checkbox" defaultChecked />
                    Activo
                  </label>
                </div>
                <button type="submit">Crear Producto</button>
                <button type="button" onClick={() => setSeccion('lista')}>Cancelar</button>
              </form>
            </div>
          )}

          {/* Editar producto */}
          {seccion === 'editar' && productoEditando && (
            <div>
              <h2>Editar Producto</h2>
              
              <form onSubmit={actualizarProducto}>
                <div>
                  <label>Nombre:</label>
                  <input name="nombre" defaultValue={productoEditando.nombre} required />
                </div>
                <div>
                  <label>Tipo de tela:</label>
                  <input name="tipo_tela" defaultValue={productoEditando.descripcion} />
                </div>
                <div>
                  <label>Precio base:</label>
                  <input name="precio_base" type="number" step="0.01" defaultValue={productoEditando.precio} required />
                </div>
                <div>
                  <label>
                    <input name="activo" type="checkbox" defaultChecked={productoEditando.activo} />
                    Activo
                  </label>
                </div>
                <button type="submit">Actualizar Producto</button>
                <button type="button" onClick={() => { setProductoEditando(null); setSeccion('lista'); }}>
                  Cancelar
                </button>
              </form>
            </div>
          )}

          {/* Gestión de variantes */}
          {seccion === 'variantes' && productoEditando && (
            <div>
              <h2>Variantes de: {productoEditando.nombre}</h2>
              
              {/* Formulario para crear variante */}
              <h3>Nueva Variante</h3>
              <form onSubmit={(e) => crearVariante(e, productoEditando.id)}>
                <div>
                  <label>Color:</label>
                  <input name="color" required />
                </div>
                <div>
                  <label>Talla:</label>
                  <input name="talla" required />
                </div>
                <div>
                  <label>Stock:</label>
                  <input name="stock" type="number" defaultValue="0" />
                </div>
                <div>
                  <label>
                    <input name="activo" type="checkbox" defaultChecked />
                    Activo
                  </label>
                </div>
                <button type="submit">Crear Variante</button>
              </form>

              {/* Lista de variantes */}
              <h3>Variantes existentes</h3>
              {(!variantes[productoEditando.id] || variantes[productoEditando.id].length === 0) ? (
                <p>No hay variantes</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Color</th>
                      <th>Talla</th>
                      <th>Stock</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantes[productoEditando.id].map(variante => (
                      <tr key={variante.id_variante}>
                        <td>{variante.id_variante}</td>
                        <td>{variante.color}</td>
                        <td>{variante.talla}</td>
                        <td>{variante.stock}</td>
                        <td>{variante.activo ? 'Sí' : 'No'}</td>
                        <td>
                          {varianteEditando?.id_variante === variante.id_variante ? (
                            <form onSubmit={(e) => actualizarVariante(e, variante.id_variante, productoEditando.id)}>
                              <input name="color" defaultValue={variante.color} required />
                              <input name="talla" defaultValue={variante.talla} required />
                              <input name="stock" type="number" defaultValue={variante.stock} />
                              <label>
                                <input name="activo" type="checkbox" defaultChecked={variante.activo} />
                                Activo
                              </label>
                              <button type="submit">Guardar</button>
                              <button type="button" onClick={() => setVarianteEditando(null)}>Cancelar</button>
                            </form>
                          ) : (
                            <>
                              <button onClick={() => setVarianteEditando(variante)}>Editar</button>
                              <button onClick={() => eliminarVariante(variante.id_variante, productoEditando.id)}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <button onClick={() => { setProductoEditando(null); setSeccion('lista'); }}>
                Volver a Productos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}