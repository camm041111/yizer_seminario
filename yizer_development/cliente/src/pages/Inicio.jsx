import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { api, assetUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function Inicio() {
  const { isAuthenticated, user, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    api.get('/catalogo')
      .then((data) => {
        setProductos((data.productos || []).slice(0, 4));
        setEstado('listo');
      })
      .catch(() => setEstado('error'));
  }, []);

  return (
    <main>
      <header className="topbar">
        <Link className="brand" to="/">YIZER</Link>
        <nav className="navlinks">
          <Link to="/catalogo"><Icon name="bag" />Catalogo</Link>
          {isAuthenticated ? <Link to="/dashboard"><Icon name="user" />Mi cuenta</Link> : <Link to="/login"><Icon name="login" />Entrar</Link>}
          {isAuthenticated && <button className="link-button" onClick={logout}><Icon name="logout" />Salir</button>}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Playeras y prendas personalizadas</p>
          <h1>YIZER</h1>
          <p>
            Elige una prenda, selecciona color y talla, agrega tus ideas de personalizacion y
            conserva tus pedidos desde tu cuenta.
          </p>
          <div className="actions">
            <Link className="button primary" to="/catalogo"><Icon name="shirt" />Explorar catalogo</Link>
            <Link className="button secondary" to={isAuthenticated ? '/dashboard' : '/login'}>
              <Icon name={isAuthenticated ? 'user' : 'userPlus'} />
              {isAuthenticated ? `Hola, ${user?.nombre_completo || user?.email}` : 'Crear cuenta'}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Disponibles ahora</p>
            <h2>Productos destacados</h2>
          </div>
          <Link to="/catalogo"><Icon name="bag" />Ver todos</Link>
        </div>

        {estado === 'cargando' && <p className="muted">Cargando productos...</p>}
        {estado === 'error' && <p className="notice error">No se pudo cargar el catalogo.</p>}
        {estado === 'listo' && (
          <div className="product-grid">
            {productos.map((producto) => (
              <article className="product-card" key={producto.id_producto}>
                <div className="product-image">
                  {producto.imagen_url ? (
                    <img src={assetUrl(producto.imagen_absoluta || producto.imagen_url)} alt={producto.nombre} />
                  ) : (
                    <span>Yizer</span>
                  )}
                </div>
                <div className="product-info">
                  <h3>{producto.nombre}</h3>
                  <p>{producto.tipo_tela || 'Sin descripcion'}</p>
                  <strong>${Number(producto.precio_base || 0).toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
