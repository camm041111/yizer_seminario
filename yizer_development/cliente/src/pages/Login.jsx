// Vista de Login - Autenticación de usuarios
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../config/api';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('cliente'); // 'admin' o 'cliente'
  
  // Estados de registro (para nuevos clientes)
  const [isRegistro, setIsRegistro] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para iniciar sesión
  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = tipoUsuario === 'admin' 
        ? '/auth/login/admin' 
        : '/auth/login/cliente';
      
      const data = await api.post(endpoint, { email, password });
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      localStorage.setItem('role', data.usuario.role);
      
      // Redireccionar según el rol
      if (data.usuario.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Función para registrar nuevo cliente
  async function handleRegistro(e) {
    e.preventDefault();
    setError(null);
    
    // Validar contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);

    try {
      const data = await api.post('/auth/registro', {
        nombre_completo: nombreCompleto,
        email,
        password,
        telefono: telefono || undefined
      });
      
      // Después de registro exitoso, hacer login automático
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      localStorage.setItem('role', data.usuario.role);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Función para cerrar sesión
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  }

  // Cambiar entre login y registro
  function toggleModo() {
    setIsRegistro(!isRegistro);
    setError(null);
  }

  return (
    <div>
      <h1>{isRegistro ? 'Registrarse' : 'Iniciar Sesión'}</h1>
      
      {/* Selector de tipo de usuario (solo en login) */}
      {!isRegistro && (
        <div>
          <label>
            <input 
              type="radio" 
              name="tipoUsuario" 
              value="cliente"
              checked={tipoUsuario === 'cliente'}
              onChange={(e) => setTipoUsuario(e.target.value)}
            />
            Cliente
          </label>
          <label>
            <input 
              type="radio" 
              name="tipoUsuario" 
              value="admin"
              checked={tipoUsuario === 'admin'}
              onChange={(e) => setTipoUsuario(e.target.value)}
            />
            Administrador
          </label>
        </div>
      )}

      {/* Mensaje de error */}
      {error && <div><p>Error: {error}</p></div>}

      {/* Formulario */}
      {isRegistro ? (
        // Formulario de Registro
        <form onSubmit={handleRegistro}>
          <div>
            <label>Nombre completo:</label>
            <input 
              type="text" 
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required 
            />
          </div>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label>Teléfono (opcional):</label>
            <input 
              type="tel" 
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div>
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div>
            <label>Confirmar contraseña:</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      ) : (
        // Formulario de Login
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      )}

      {/* Toggle entre login y registro */}
      <button type="button" onClick={toggleModo}>
        {isRegistro ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Regístrate'}
      </button>

      {/* Links de navegación */}
      <div>
        <Link to="/">Volver al inicio</Link>
        <Link to="/catalogo">Ver catálogo</Link>
      </div>
    </div>
  );
}