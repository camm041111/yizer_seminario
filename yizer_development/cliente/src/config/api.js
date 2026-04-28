// Configuración de conexión al servidor
const BASE_URL = 'http://localhost:3036/api';

// Función helper para hacer peticiones
export async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Si hay token en las opciones, agregarlo al header
  if (options.token) {
    config.headers['Authorization'] = `Bearer ${options.token}`;
  }

  // Eliminar token del objeto para no pasarlo a fetch
  delete config.token;

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de conexión' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Métodos convenience
export const api = {
  get: (endpoint, token) => fetchAPI(endpoint, { method: 'GET', token }),
  post: (endpoint, data, token) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data), token }),
  put: (endpoint, data, token) => fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data), token }),
  delete: (endpoint, token) => fetchAPI(endpoint, { method: 'DELETE', token }),
};

export default api;