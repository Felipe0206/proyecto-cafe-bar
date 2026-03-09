import axios from 'axios';

/**
 * Configuración base de Axios para todas las peticiones API
 */
const API_BASE_URL = 'http://localhost:8080/cafebar/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token si existe
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no autorizado
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Servicio de Mesas
 */
export const mesaService = {
  getAll: () => api.get('/mesas'),
  getById: (id) => api.get(`/mesas?id=${id}`),
  getByEstado: (estado) => api.get(`/mesas?estado=${estado}`),
  create: (mesa) => api.post('/mesas', mesa),
  update: (mesa) => api.put('/mesas', mesa),
  delete: (id) => api.delete(`/mesas?id=${id}`)
};

/**
 * Servicio de Productos
 */
export const productoService = {
  getAll: () => api.get('/productos'),
  getById: (id) => api.get(`/productos?id=${id}`),
  getByCategoria: (catId) => api.get(`/productos?categoria=${catId}`),
  create: (producto) => api.post('/productos', producto),
  update: (producto) => api.put('/productos', producto),
  delete: (id) => api.delete(`/productos?id=${id}`)
};

/**
 * Servicio de Pedidos
 */
export const pedidoService = {
  getAll: () => api.get('/pedidos'),
  getById: (id) => api.get(`/pedidos?id=${id}`),
  getByMesa: (mesaId) => api.get(`/pedidos?mesa=${mesaId}`),
  getByEstado: (estado) => api.get(`/pedidos?estado=${estado}`),
  getByUsuario: (usuarioId) => api.get(`/pedidos?usuario=${usuarioId}`),
  create: (pedido) => api.post('/pedidos', pedido),
  update: (pedido) => api.put('/pedidos', pedido),
  cambiarEstado: (id, estado) => api.put('/pedidos', { id: String(id), estado }),
  delete: (id) => api.delete(`/pedidos?id=${id}`)
};

/**
 * Servicio de Reservas
 */
export const reservaService = {
  getAll: () => api.get('/reservas'),
  getById: (id) => api.get(`/reservas?id=${id}`),
  getByUsuario: (userId) => api.get(`/reservas?usuario=${userId}`),
  create: (reserva) => api.post('/reservas', reserva),
  update: (reserva) => api.put('/reservas', reserva),
  confirmar: (id) => api.put('/reservas', { id: String(id), estado: 'confirmada' }),
  cancelar: (id) => api.put('/reservas', { id: String(id), estado: 'cancelada' }),
  delete: (id) => api.delete(`/reservas?id=${id}`)
};

/**
 * Servicio de Usuarios
 */
export const usuarioService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios?id=${id}`),
  getByRol: (rol) => api.get(`/usuarios?rol=${rol}`),
  create: (usuario) => api.post('/usuarios', usuario),
  update: (usuario) => api.put('/usuarios', usuario),
  delete: (id) => api.delete(`/usuarios?id=${id}`)
};

/**
 * Servicio de Categorías
 */
export const categoriaService = {
  getAll: () => api.get('/categorias'),
  getActivas: () => api.get('/categorias?activas=true'),
  create: (categoria) => api.post('/categorias', categoria),
  update: (categoria) => api.put('/categorias', categoria),
  delete: (id) => api.delete(`/categorias?id=${id}`)
};
