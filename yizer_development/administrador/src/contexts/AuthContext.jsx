import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'adminToken';
const LEGACY_TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'adminUser';

const decodeJwtPayload = (jwt) => {
  try {
    const [, payload] = String(jwt).split('.');
    if (!payload) return null;
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(atob(normalizedPayload));
  } catch {
    return null;
  }
};

const isTokenUsable = (jwt) => {
  const payload = decodeJwtPayload(jwt);
  if (!payload) return false;
  if (payload.role !== 'admin') return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
};

const getStoredSession = () => {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
  if (!storedToken || !isTokenUsable(storedToken)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return { token: null, user: null };
  }

  if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
    localStorage.setItem(TOKEN_STORAGE_KEY, storedToken);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  }

  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  return {
    token: storedToken,
    user,
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const storedSession = getStoredSession();
  const [user, setUser] = useState(storedSession.user);
  const [token, setToken] = useState(storedSession.token);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && error.response?.data?.error?.includes('Token')) {
          logout();
          window.location.assign('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login/admin', { email, password });
      const { token: newToken, user } = response.data;
      if (!isTokenUsable(newToken)) {
        return {
          success: false,
          error: 'El servidor devolvió un token inválido',
        };
      }
      setToken(newToken);
      setUser(user);
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Error al iniciar sesión',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
