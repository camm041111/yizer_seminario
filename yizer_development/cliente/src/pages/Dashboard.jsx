// Vista de Dashboard - Panel de control para clientes y administradores
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Estados de datos
  const [usuario, setUsuario] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [personalizaciones, setPersonalizaciones] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccion, setSeccion] = useState('pedidos'); // 'pedidos', 'perfil', 'admin'
  
  // Datos de admin
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [administradores, setAdministradores] = useState([]);

  // Cargar datos al iniciar
  useEffect(() => {
    verificarAuth();
  }, []);

  // Cargar datos según rol
  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [usuario, seccion]);

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
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      navigate('/login');
    }
  }

  // Función para cargar datos según la sección
  async function cargarDatos() {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    
    try {
      if (usuario.role === 'admin') {
        // Cargar datos de admin
        await Promise.all([
          cargarPedidosAdmin(token),
          cargarClientes(token),
          cargarProductos(token),
          cargarAdministradores(token)
        ]);
      } else {
        // Cargar datos de cliente
        await Promise.all([
          cargarPedidosCliente(token),
          cargarPersonalizaciones(token)
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Cargar pedidos (admin)
  async function cargarPedidosAdmin(token) {
    const data = await api.get('/pedidos', token);
    setPedidos(data);
  }

  // Cargar pedidos (cliente)
  async function cargarPedidosCliente(token) {
    const data = await api.get('/pedidos', token);
    setPedidos(data);
  }

  // Cargar personalizaciones
  async function cargarPersonalizaciones(token) {
    const data = await api.get('/personalizaciones', token);
    setPersonalizaciones(data);
  }

  // Cargar clientes (admin)
  async function cargarClientes(token) {
    const data = await api.get('/clientes', token);
    setClientes(data);
  }

  // Cargar productos (admin)
  async function cargarProductos(token) {
    const data = await api.get('/productos');
    setProductos(data);
  }

  // Cargar administradores (admin)
  async function cargarAdministradores(token) {
    const data = await api.get('/administradores', token);
    setAdministradores(data);
  }

  // Función para cerrar sesión
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  }

  // Función para actualizar perfil
  async function actualizarPerfil(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    
    try {
      await api.put(`/clientes/${usuario.id}`, datos, token);
      alert('Perfil actualizado');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para crear nuevo cliente (admin)
  async function crearCliente(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    
    try {
      await api.post('/clientes', datos, token);
      alert('Cliente creado');
      cargarClientes(token);
      e.target.reset();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para crear nuevo producto (admin)
  async function crearProducto(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    datos.precio_base = parseFloat(datos.precio_base);
    
    try {
      await api.post('/productos', datos, token);
      alert('Producto creado');
      cargarProductos(token);
      e.target.reset();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para crear nuevo administrador (admin)
  async function crearAdministrador(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    
    try {
      await api.post('/administradores', datos, token);
      alert('Administrador creado');
      cargarAdministradores(token);
      e.target.reset();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para actualizar estado de pedido (admin)
  async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    const token = localStorage.getItem('token');
    
    try {
      await api.put(`/pedidos/${idPedido}`, { estado: nuevoEstado }, token);
      cargarPedidosAdmin(token);
      alert('Estado actualizado');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  // Función para crear personalización
  async function crearPersonalizacion(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData);
    
    try {
      await api.post('/personalizaciones', datos, token);
      alert('Personalización creada');
      cargarPersonalizaciones(token);
      e.target.reset();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div>
      {/* Header */}
      <header>
        <h1>Dashboard - Yizer</h1>
        <div>
          <span>Bienvenido, {usuario?.nombre_completo || usuario?.nombre || usuario?.email}</span>
          <span>Rol: {usuario?.role}</span>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Navegación */}
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/catalogo">Catálogo</Link>
        <Link to="/login">Login</Link>
      </nav>

      {/* Menú según rol */}
      <div>
        {usuario?.role === 'admin' ? (
          // Menú Admin
          <>
            <button onClick={() => setSeccion('pedidos')}>Pedidos</button>
            <button onClick={() => setSeccion('clientes')}>Clientes</button>
            <button onClick={() => setSeccion('productos')}>Productos</button>
            <button onClick={() => setSeccion('administradores')}>Administradores</button>
            <button onClick={() => setSeccion('perfil')}>Mi Perfil</button>
          </>
        ) : (
          // Menú Cliente
          <>
            <button onClick={() => setSeccion('pedidos')}>Mis Pedidos</button>
            <button onClick={() => setSeccion('personalizaciones')}>Mis Personalizaciones</button>
            <button onClick={() => setSeccion('perfil')}>Mi Perfil</button>
          </>
        )}
      </div>

      {/* Contenido según sección */}
      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div>
          {/* Sección Pedidos (para ambos roles) */}
          {seccion === 'pedidos' && (
            <div>
              <h2>{usuario?.role === 'admin' ? 'Todos los Pedidos' : 'Mis Pedidos'}</h2>
              
              {pedidos.length === 0 ? (
                <p>No hay pedidos</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                      {usuario?.role === 'admin' && <th>Cliente ID</th>}
                      {usuario?.role === 'admin' && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(pedido => (
                      <tr key={pedido.id_pedido}>
                        <td>{pedido.id_pedido}</td>
                        <td>{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                        <td>{pedido.estado}</td>
                        <td>${pedido.total}</td>
                        {usuario?.role === 'admin' && <td>{pedido.id_cliente}</td>}
                        {usuario?.role === 'admin' && (
                          <td>
                            <select 
                              value={pedido.estado}
                              onChange={(e) => actualizarEstadoPedido(pedido.id_pedido, e.target.value)}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En Proceso</option>
                              <option value="enviado">Enviado</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Sección Clientes (Admin) */}
          {seccion === 'clientes' && usuario?.role === 'admin' && (
            <div>
              <h2>Gestión de Clientes</h2>
              
              {/* Formulario para crear cliente */}
              <h3>Nuevo Cliente</h3>
              <form onSubmit={crearCliente}>
                <input name="nombre_completo" placeholder="Nombre completo" required />
                <input name="email" type="email" placeholder="Email" required />
                <input name="telefono" placeholder="Teléfono" />
                <input name="password" type="password" placeholder="Contraseña" required />
                <button type="submit">Crear Cliente</button>
              </form>

              {/* Lista de clientes */}
              <h3>Lista de Clientes</h3>
              {clientes.length === 0 ? (
                <p>No hay clientes</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map(cliente => (
                      <tr key={cliente.id_cliente}>
                        <td>{cliente.id_cliente}</td>
                        <td>{cliente.nombre_completo}</td>
                        <td>{cliente.email}</td>
                        <td>{cliente.telefono}</td>
                        <td>{new Date(cliente.fecha_registro).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Sección Productos (Admin) */}
          {seccion === 'productos' && usuario?.role === 'admin' && (
            <div>
              <h2>Gestión de Productos</h2>
              
              {/* Formulario para crear producto */}
              <h3>Nuevo Producto</h3>
              <form onSubmit={crearProducto}>
                <input name="nombre" placeholder="Nombre del producto" required />
                <input name="tipo_tela" placeholder="Tipo de tela" />
                <input name="precio_base" type="number" step="0.01" placeholder="Precio base" required />
                <label>
                  <input name="activo" type="checkbox" defaultChecked />
                  Activo
                </label>
                <button type="submit">Crear Producto</button>
              </form>

              {/* Lista de productos */}
              <h3>Lista de Productos</h3>
              {productos.length === 0 ? (
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
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(producto => (
                      <tr key={producto.id}>
                        <td>{producto.id}</td>
                        <td>{producto.nombre}</td>
                        <td>{producto.descripcion}</td>
                        <td>${producto.precio}</td>
                        <td>{producto.activo ? 'Sí' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Sección Administradores (Admin) */}
          {seccion === 'administradores' && usuario?.role === 'admin' && (
            <div>
              <h2>Gestión de Administradores</h2>
              
              {/* Formulario para crear administrador */}
              <h3>Nuevo Administrador</h3>
              <form onSubmit={crearAdministrador}>
                <input name="nombre" placeholder="Nombre" required />
                <input name="email" type="email" placeholder="Email" required />
                <input name="password" type="password" placeholder="Contraseña" required />
                <button type="submit">Crear Administrador</button>
              </form>

              {/* Lista de administradores */}
              <h3>Lista de Administradores</h3>
              {administradores.length === 0 ? (
                <p>No hay administradores</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {administradores.map(admin => (
                      <tr key={admin.id_administrador}>
                        <td>{admin.id_administrador}</td>
                        <td>{admin.nombre}</td>
                        <td>{admin.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Sección Personalizaciones (Cliente) */}
          {seccion === 'personalizaciones' && usuario?.role === 'cliente' && (
            <div>
              <h2>Mis Personalizaciones</h2>
              
              {/* Formulario para crear personalización */}
              <h3>Nueva Personalización</h3>
              <form onSubmit={crearPersonalizacion}>
                <select name="tipo_personalizacion" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="texto">Texto</option>
                  <option value="imagen">Imagen</option>
                  <option value="ambos">Texto e Imagen</option>
                </select>
                <input name="texto_personalizado" placeholder="Texto personalizado" />
                <input name="url_imagen" placeholder="URL de imagen" />
                <input name="color_impresion" placeholder="Color de impresión" />
                <input name="posicion" placeholder="Posición" />
                <button type="submit">Crear Personalización</button>
              </form>

              {/* Lista de personalizaciones */}
              <h3>Mis Personalizaciones</h3>
              {personalizaciones.length === 0 ? (
                <p>No hay personalizaciones</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Texto</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalizaciones.map(per => (
                      <tr key={per.id_personalizacion}>
                        <td>{per.id_personalizacion}</td>
                        <td>{per.tipo_personalizacion}</td>
                        <td>{per.texto_personalizado}</td>
                        <td>{new Date(per.fecha_creacion).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Sección Perfil (para ambos roles) */}
          {seccion === 'perfil' && (
            <div>
              <h2>Mi Perfil</h2>
              
              <form onSubmit={actualizarPerfil}>
                {usuario?.role === 'cliente' && (
                  <>
                    <label>Nombre completo:</label>
                    <input 
                      name="nombre_completo" 
                      defaultValue={usuario?.nombre_completo} 
                    />
                  </>
                )}
                {usuario?.role === 'admin' && (
                  <>
                    <label>Nombre:</label>
                    <input 
                      name="nombre" 
                      defaultValue={usuario?.nombre} 
                    />
                  </>
                )}
                <label>Email:</label>
                <input 
                  name="email" 
                  type="email" 
                  defaultValue={usuario?.email} 
                  disabled 
                />
                {usuario?.role === 'cliente' && (
                  <>
                    <label>Teléfono:</label>
                    <input 
                      name="telefono" 
                      defaultValue={usuario?.telefono} 
                    />
                  </>
                )}
                <label>Nueva contraseña (opcional):</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Nueva contraseña" 
                />
                <button type="submit">Actualizar Perfil</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}