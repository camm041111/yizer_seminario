import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { api, assetUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    const pago = parametroReal(searchParams.get('pago'));
    const status = parametroReal(searchParams.get('status')) || parametroReal(searchParams.get('collection_status'));
    const estadoPago = normalizarEstadoPago(pago) || normalizarEstadoPago(status);
    const pedido = parametroReal(searchParams.get('pedido')) || parametroReal(searchParams.get('external_reference')) || localStorage.getItem('pedidoPendientePago');
    const paymentId = parametroReal(searchParams.get('payment_id')) || parametroReal(searchParams.get('collection_id'));
    if (!estadoPago && !paymentId) return;

    const etiquetaPedido = pedido ? ` del pedido #${pedido}` : '';
    if (estadoPago === 'aprobado') setMensaje(`Pago aprobado${etiquetaPedido}.`);
    if (estadoPago === 'pendiente') setMensaje(`Pago pendiente${etiquetaPedido}.`);
    if (estadoPago === 'fallido') setMensaje(`El pago no fue completado${etiquetaPedido}.`);

    if (isAuthenticated && (paymentId || (estadoPago === 'aprobado' && pedido))) {
      api.post('/pagos/mercadopago/confirmar-retorno', {
        payment_id: paymentId,
        id_pedido: pedido,
        estado_pago: estadoPago,
      }, token)
        .then(() => {
          localStorage.removeItem('pedidoPendientePago');
          cargarDatos();
        })
        .catch((err) => setMensaje(err.message));
    }
  }, [cargarDatos, isAuthenticated, searchParams, token]);

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
        <Link className="brand" to="/">YIZER</Link>
        <nav className="navlinks">
          <Link to="/catalogo"><Icon name="bag" />Catalogo</Link>
          <button className="link-button" onClick={logout}><Icon name="logout" />Salir</button>
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
                <Link className="button secondary" to="/catalogo"><Icon name="plus" />Nuevo pedido</Link>
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
                      <button className="button secondary" onClick={() => abrirPedido(pedido.id_pedido)}><Icon name="package" />Detalle</button>
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
              <button className="button primary"><Icon name="user" />Actualizar perfil</button>
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
            {pedidoDetalle.notas && (
              <p className="muted preserved-text">{pedidoDetalle.notas}</p>
            )}
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

function normalizarEstadoPago(status) {
  if (status === 'aprobado' || status === 'approved') return 'aprobado';
  if (status === 'pendiente' || status === 'pending' || status === 'in_process') return 'pendiente';
  if (status === 'fallido' || status === 'rejected' || status === 'cancelled' || status === 'null') return 'fallido';
  return '';
}

function parametroReal(valor) {
  if (!valor || valor === 'null' || valor === 'undefined') return '';
  return valor;
}
