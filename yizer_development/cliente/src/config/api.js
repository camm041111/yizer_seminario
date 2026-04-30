const BASE_URL = 'http://localhost:3036/api';
export const API_BASE_URL = BASE_URL;
export const SERVER_BASE_URL = BASE_URL.replace(/\/api$/, '');

export async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    config.headers['Authorization'] = `Bearer ${options.token}`;
  }

  delete config.token;

  const response = await fetch(url, config);

  if (response.status === 204) return null;

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(error.error || error.message || `Error HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint, token) => fetchAPI(endpoint, { method: 'GET', token }),
  post: (endpoint, data, token) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data), token }),
  postForm: (endpoint, data, token) => fetchAPI(endpoint, { method: 'POST', body: data, token }),
  put: (endpoint, data, token) => fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data), token }),
  delete: (endpoint, token) => fetchAPI(endpoint, { method: 'DELETE', token }),
};

export function assetUrl(path) {
  if (!path) return '';
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${SERVER_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export default api;
