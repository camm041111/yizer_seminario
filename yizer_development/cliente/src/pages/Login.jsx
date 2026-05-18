import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';

const inicial = {
  nombre_completo: '',
  email: '',
  telefono: '',
  password: '',
  confirmar: '',
};

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState(inicial);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  function cambiarCampo(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function enviar(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = modo === 'registro'
        ? await registrar()
        : await api.post('/auth/login/cliente', {
            email: form.email,
            password: form.password,
          });

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function registrar() {
    if (form.password !== form.confirmar) {
      throw new Error('Las contrasenas no coinciden');
    }
    return api.post('/auth/registro', {
      nombre_completo: form.nombre_completo,
      email: form.email,
      telefono: form.telefono || undefined,
      password: form.password,
    });
  }

  return (
    <main>
      <header className="topbar">
        <Link className="brand" to="/">YIZER</Link>
        <nav className="navlinks">
          <Link to="/catalogo"><Icon name="bag" />Catalogo</Link>
        </nav>
      </header>

      <section className="auth-shell">
        <div className="auth-copy">
          <p className="eyebrow">Cuenta de cliente</p>
          <h1>{modo === 'registro' ? 'Crea tu cuenta' : 'Entra a Yizer'}</h1>
          <p>
            Tu cuenta guarda pedidos, datos de contacto y personalizaciones para que el proceso de
            compra sea mas rapido.
          </p>
        </div>

        <form className="panel form" onSubmit={enviar}>
          <div className="segmented">
            <button type="button" className={modo === 'login' ? 'active' : ''} onClick={() => setModo('login')}>
              Entrar
            </button>
            <button type="button" className={modo === 'registro' ? 'active' : ''} onClick={() => setModo('registro')}>
              Registro
            </button>
          </div>

          {error && <p className="notice error">{error}</p>}

          {modo === 'registro' && (
            <>
              <label>
                Nombre completo
                <input name="nombre_completo" value={form.nombre_completo} onChange={cambiarCampo} required />
              </label>
              <label>
                Telefono
                <input name="telefono" value={form.telefono} onChange={cambiarCampo} />
              </label>
            </>
          )}

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={cambiarCampo} required />
          </label>
          <label>
            Contrasena
            <span className="password-field">
              <input
                name="password"
                type={mostrarPassword ? 'text' : 'password'}
                value={form.password}
                onChange={cambiarCampo}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={mostrarPassword ? 'Ocultar contrasena' : 'Ver contrasena'}
                onClick={() => setMostrarPassword((actual) => !actual)}
                title={mostrarPassword ? 'Ocultar contrasena' : 'Ver contrasena'}
              >
                <Icon name={mostrarPassword ? 'eyeOff' : 'eye'} />
              </button>
            </span>
          </label>
          {modo === 'registro' && (
            <label>
              Confirmar contrasena
              <span className="password-field">
                <input
                  name="confirmar"
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={form.confirmar}
                  onChange={cambiarCampo}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={mostrarConfirmar ? 'Ocultar contrasena' : 'Ver contrasena'}
                  onClick={() => setMostrarConfirmar((actual) => !actual)}
                  title={mostrarConfirmar ? 'Ocultar contrasena' : 'Ver contrasena'}
                >
                  <Icon name={mostrarConfirmar ? 'eyeOff' : 'eye'} />
                </button>
              </span>
            </label>
          )}

          <button className="button primary full" disabled={loading}>
            <Icon name={modo === 'registro' ? 'userPlus' : 'login'} />
            {loading ? 'Procesando...' : modo === 'registro' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
