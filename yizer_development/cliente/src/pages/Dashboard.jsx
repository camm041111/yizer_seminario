import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, assetUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  const [tab, setTab] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');

  const resumen = useMemo(() => ({
    pedidos: pedidos.length,
    pendientes: pedidos.filter((pedido) => pedido.estado === 'pendiente').length,
  }), [pedidos]);

  const cargarDatos = useCallback(async () => {
    setEstado('cargando');
    setMensaje('');
    try {
      const [misPedidos, miPerfil] = await Promise.all([
        api.get('/pedidos', token),
        api.get(`/clientes/${user?.id}`, token),
      ]);
      setPedidos(misPedidos);
      setPerfil(miPerfil);
      setEstado('listo');
    } catch (err) {
      setMensaje(err.message);
      setEstado('error');
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (isAuthenticated) cargarDatos();
  }, [cargarDatos, isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  async function abrirPedido(idPedido) {
    try {
      const detalle = await api.get(`/pedidos/${idPedido}`, token);
      setPedidoDetalle(detalle);
    } catch (err) {
      setMensaje(err.message);
    }
  }

  async function actualizarPerfil(event) {
    event.preventDefault();
    const datos = limpiarVacios(Object.fromEntries(new FormData(event.currentTarget)));
    try {
      const actualizado = await api.put(`/clientes/${user.id}`, datos, token);
      setPerfil(actualizado);
      login({ ...user, ...actualizado, role: user.role }, token);
      setMensaje('Perfil actualizado.');
    } catch (err) {
      setMensaje(err.message);
    }
  }

  return (
    <main>
      <header className="topbar">
        <Link className="brand" to="/">Yizer</Link>
        <nav className="navlinks">
          <Link to="/catalogo">Catalogo</Link>
          <button className="link-button" onClick={logout}>Salir</button>
        </nav>
      </header>

      <section className="account-layout">
        <aside className="account-aside">
          <p className="eyebrow">Mi cuenta</p>
          <h1>{perfil?.nombre_completo || user?.nombre_completo || user?.email}</h1>
          <div className="stats">
            <div><strong>{resumen.pedidos}</strong><span>Pedidos</span></div>
            <div><strong>{resumen.pendientes}</strong><span>Pendientes</span></div>
          </div>
          <div className="tabs">
            <button className={tab === 'pedidos' ? 'active' : ''} onClick={() => setTab('pedidos')}>Pedidos</button>
            <button className={tab === 'perfil' ? 'active' : ''} onClick={() => setTab('perfil')}>Perfil</button>
          </div>
        </aside>

        <section className="account-content">
          {estado === 'cargando' && <p className="muted">Cargando tu informacion...</p>}
          {mensaje && <p className={`notice ${mensaje.includes('Error') ? 'error' : 'success'}`}>{mensaje}</p>}
          {estado === 'error' && <button className="button secondary" onClick={cargarDatos}>Reintentar</button>}

          {estado === 'listo' && tab === 'pedidos' && (
            <div className="panel">
              <div className="section-head compact">
                <div>
                  <p className="eyebrow">Historial</p>
                  <h2>Mis pedidos</h2>
                </div>
                <Link className="button secondary" to="/catalogo">Nuevo pedido</Link>
              </div>
              {!pedidos.length ? (
                <p className="muted">Aun no tienes pedidos registrados.</p>
              ) : (
                <div className="table-list">
                  {pedidos.map((pedido) => (
                    <article className="order-row" key={pedido.id_pedido}>
                      <div>
                        <strong>Pedido #{pedido.id_pedido}</strong>
                        <span>{new Date(pedido.fecha_pedido).toLocaleDateString()}</span>
                      </div>
                      <span className="status">{pedido.estado}</span>
                      <strong>${Number(pedido.total || 0).toFixed(2)}</strong>
                      <button className="button secondary" onClick={() => abrirPedido(pedido.id_pedido)}>Detalle</button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {estado === 'listo' && tab === 'perfil' && perfil && (
            <form className="panel form narrow" onSubmit={actualizarPerfil}>
              <h2>Perfil</h2>
              <label>
                Nombre completo
                <input name="nombre_completo" defaultValue={perfil.nombre_completo || ''} required />
              </label>
              <label>
                Email
                <input name="email" type="email" defaultValue={perfil.email || ''} required />
              </label>
              <label>
                Telefono
                <input name="telefono" defaultValue={perfil.telefono || ''} />
              </label>
              <label>
                Nueva contrasena
                <input name="password" type="password" minLength="6" />
              </label>
              <button className="button primary">Actualizar perfil</button>
            </form>
          )}
        </section>
      </section>

      {pedidoDetalle && (
        <div className="modal-backdrop" onClick={() => setPedidoDetalle(null)}>
          <section className="modal panel" onClick={(event) => event.stopPropagation()}>
            <div className="section-head compact">
              <div>
                <p className="eyebrow">Detalle</p>
                <h2>Pedido #{pedidoDetalle.id_pedido}</h2>
              </div>
              <button className="link-button" onClick={() => setPedidoDetalle(null)}>Cerrar</button>
            </div>
            <p className="status">{pedidoDetalle.estado}</p>
            <div className="list">
              {pedidoDetalle.detalles?.map((detalle) => (
                <article className="saved-item order-detail-item" key={detalle.id_detalle}>
                  <OrderCustomizationPreview detalle={detalle} />
                  <div>
                    <strong>{detalle.producto_nombre}</strong>
                    <span>{detalle.color} / {detalle.talla} x {detalle.cantidad}</span>
                    {detalle.personalizacion_tipo && (
                      <small>
                        Personalizacion: {detalle.personalizacion_tipo}
                        {detalle.personalizacion_texto ? ` - ${detalle.personalizacion_texto}` : ''}
                        {detalle.personalizacion_posicion ? ` (${detalle.personalizacion_posicion})` : ''}
                      </small>
                    )}
                  </div>
                  <strong>${Number(detalle.subtotal || 0).toFixed(2)}</strong>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function OrderCustomizationPreview({ detalle }) {
  const vistaPrevia = assetUrl(detalle.personalizacion_vista_previa_url);
  const productoImagen = assetUrl(detalle.producto_imagen_url);
  const personalizacionImagen = assetUrl(detalle.personalizacion_url);
  const posicion = obtenerTransformacion(detalle.personalizacion_posicion);
  const mostrarTexto = detalle.personalizacion_tipo !== 'imagen' && detalle.personalizacion_texto;
  const mostrarImagen = detalle.personalizacion_tipo !== 'texto' && personalizacionImagen;
  const tienePersonalizacion = detalle.personalizacion_tipo && (mostrarTexto || mostrarImagen);

  if (vistaPrevia) {
    return (
      <div className="mini-preview">
        <img src={vistaPrevia} alt={`Pedido personalizado de ${detalle.producto_nombre}`} />
      </div>
    );
  }

  return (
    <div className="mini-preview">
      {productoImagen ? (
        <img src={productoImagen} alt={detalle.producto_nombre} />
      ) : (
        <span>{detalle.producto_nombre}</span>
      )}
      {tienePersonalizacion && (
        <div
          className="mini-placement"
          style={{
            left: `${posicion.x}%`,
            top: `${posicion.y}%`,
            transform: `translate(-50%, -50%) rotate(${posicion.rotacion}deg) scale(${posicion.escala / 100})`,
          }}
        >
          {mostrarImagen && <img src={personalizacionImagen} alt="Imagen personalizada" />}
          {mostrarTexto && (
            <strong style={{ color: detalle.personalizacion_color || '#111111' }}>
              {detalle.personalizacion_texto}
            </strong>
          )}
        </div>
      )}
    </div>
  );
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

function limpiarVacios(objeto) {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== '' && valor !== undefined)
  );
}
