import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas comunes
import Login from './pages/common/Login';

// Páginas de Cliente
import MenuCliente from './pages/cliente/Menu';
import PedidosCliente from './pages/cliente/Pedidos';
import ReservasCliente from './pages/cliente/Reservas';

// Páginas de Trabajador
import DashboardTrabajador from './pages/trabajador/Dashboard';
import GestionPedidosTrabajador from './pages/trabajador/Pedidos';
import MesasTrabajador from './pages/trabajador/Mesas';
import InventarioTrabajador from './pages/trabajador/Inventario';
import IncidenciasTrabajador from './pages/trabajador/Incidencias';

// Páginas de Administrador
import DashboardAdmin from './pages/administrador/Dashboard';
import Usuarios from './pages/administrador/Usuarios';
import Productos from './pages/administrador/Productos';
import MesasAdmin from './pages/administrador/Mesas';
import Reportes from './pages/administrador/Reportes';
import PedidosAdmin from './pages/administrador/Pedidos';
import ReservasAdmin from './pages/administrador/Reservas';

import './App.css';

const ROLES_CLIENTE = ['cliente', 'cajero'];
const ROLES_TRABAJADOR = ['trabajador', 'mesero', 'chef'];
const ROLES_ADMIN = ['administrador', 'gerente'];

/**
 * Componente de ruta protegida
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) {
    // Guardar la URL completa (con query params) para redirigir después del login
    const destino = window.location.pathname + window.location.search;
    return <Navigate to={`/login?from=${encodeURIComponent(destino)}`} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.rol)) return <Navigate to="/" replace />;

  return children;
};

/**
 * Layout con navegación para usuarios autenticados
 */
const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const navLinks = () => {
    if (ROLES_CLIENTE.includes(user?.rol)) return [
      { to: '/cliente/menu', label: 'Menú' },
      { to: '/cliente/pedidos', label: 'Mis Pedidos' },
      { to: '/cliente/reservas', label: 'Reservas' },
    ];
    if (ROLES_TRABAJADOR.includes(user?.rol)) return [
      { to: '/trabajador/dashboard', label: 'Dashboard' },
      { to: '/trabajador/pedidos', label: 'Pedidos' },
      { to: '/trabajador/mesas', label: 'Mesas' },
      { to: '/trabajador/inventario', label: 'Inventario' },
      { to: '/trabajador/incidencias', label: 'Incidencias' },
    ];
    if (ROLES_ADMIN.includes(user?.rol)) return [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/usuarios', label: 'Usuarios' },
      { to: '/admin/productos', label: 'Productos' },
      { to: '/admin/mesas', label: 'Mesas' },
      { to: '/admin/pedidos', label: 'Pedidos' },
      { to: '/admin/reservas', label: 'Reservas' },
      { to: '/admin/reportes', label: 'Reportes' },
    ];
    return [];
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>☕ Café Bar</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {navLinks().map(link => (
            <a key={link.to} href={link.to}
              style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', textDecoration: 'none', color: window.location.pathname === link.to ? '#2563eb' : '#374151', background: window.location.pathname === link.to ? '#eff6ff' : 'transparent', fontSize: '0.88rem' }}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="navbar-user">
          <span>{user?.nombre}</span>
          <span className="badge">{user?.rol}</span>
          <button onClick={logout} className="btn-logout">Salir</button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

/**
 * Redirección según rol
 */
const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (ROLES_CLIENTE.includes(user.rol)) return <Navigate to="/cliente/menu" replace />;
  if (ROLES_TRABAJADOR.includes(user.rol)) return <Navigate to="/trabajador/dashboard" replace />;
  if (ROLES_ADMIN.includes(user.rol)) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          {/* CLIENTE - Menú es público (ver sin login, pedir requiere registro) */}
          <Route path="/cliente/menu" element={<MenuCliente />} />
          <Route path="/cliente/pedidos" element={<ProtectedRoute allowedRoles={ROLES_CLIENTE}><Layout><PedidosCliente /></Layout></ProtectedRoute>} />
          <Route path="/cliente/reservas" element={<ProtectedRoute allowedRoles={ROLES_CLIENTE}><Layout><ReservasCliente /></Layout></ProtectedRoute>} />

          {/* TRABAJADOR */}
          <Route path="/trabajador/dashboard" element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><DashboardTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/pedidos" element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><GestionPedidosTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/mesas" element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><MesasTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/inventario" element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><InventarioTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/incidencias" element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><IncidenciasTrabajador /></Layout></ProtectedRoute>} />

          {/* ADMINISTRADOR */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><DashboardAdmin /></Layout></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><Usuarios /></Layout></ProtectedRoute>} />
          <Route path="/admin/productos" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><Productos /></Layout></ProtectedRoute>} />
          <Route path="/admin/mesas" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><MesasAdmin /></Layout></ProtectedRoute>} />
          <Route path="/admin/reportes" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><Reportes /></Layout></ProtectedRoute>} />
          <Route path="/admin/pedidos" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><PedidosAdmin /></Layout></ProtectedRoute>} />
          <Route path="/admin/reservas" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><ReservasAdmin /></Layout></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
