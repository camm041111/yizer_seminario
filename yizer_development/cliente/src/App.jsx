import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Inicio from './pages/Inicio';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import Productos from './pages/Productos';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/catalogo" element={<Catalogo />} />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          
          {/* Rutas de API del servidor como referencia:
              /api/auth/login/admin
              /api/auth/login/cliente
              /api/auth/registro
              /api/administradores
              /api/clientes
              /api/productos
              /api/productos/:id/variantes
              /api/variantes
              /api/personalizaciones
              /api/pedidos
          */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}