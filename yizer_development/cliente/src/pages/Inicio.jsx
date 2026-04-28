// Vista de Inicio - Página pública principal
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';

export default function Inicio() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos destacados del catálogo
  useEffect(() => {
    cargarCatalogo();
  }, []);

  async function cargarCatalogo() {
    try {
      setLoading(true);
      const data = await api.get('/catalogo');
      // Mostrar solo los primeros 6 productos
      setProductos(data.productos?.slice(0, 6) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header/Navegación */}
      <nav>
        <div>
          <h1>Yizer</h1>
        </div>
        <div>
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section>
        <h2>Bienvenido a Yizer</h2>
        <p>Tu tienda de confianza para productos personalizados</p>
        <Link to="/catalogo">Ver Catálogo</Link>
      </section>

      {/* Productos Destacados */}
      <section>
        <h3>Productos Destacados</h3>
        
        {loading && <p>Cargando...</p>}
        {error && <p>Error: {error}</p>}
        
        {!loading && !error && productos.length > 0 && (
          <div>
            {productos.map(producto => (
              <div key={producto.id_producto}>
                <img src={producto.imagen_absoluta || producto.imagen_url} alt={producto.nombre} />
                <h4>{producto.nombre}</h4>
                <p>{producto.tipo_tela}</p>
                <p>Precio: ${producto.precio_base}</p>
                <Link to={`/catalogo?producto=${producto.id_producto}`}>Ver detalles</Link>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && productos.length === 0 && (
          <p>No hay productos disponibles</p>
        )}
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2026 Yizer. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}