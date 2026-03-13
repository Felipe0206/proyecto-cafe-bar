import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  LayoutDashboard, Users, Coffee, TableProperties, ClipboardList,
  CalendarDays, BarChart2, Package, AlertTriangle, UtensilsCrossed,
  LogOut, ChevronLeft, ChevronRight, ChefHat, Map
} from 'lucide-react';

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
import PlanoCafeteria from './pages/administrador/Plano';

import './App.css';

const ROLES_CLIENTE = ['cliente'];
const ROLES_TRABAJADOR = ['trabajador', 'mesero', 'chef', 'cajero'];
const ROLES_ADMIN = ['administrador', 'gerente'];
// Rutas de trabajador también accesibles por gerente
const ROLES_TRABAJADOR_EXTENDED = [...ROLES_TRABAJADOR, 'gerente'];

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) {
    const destino = window.location.pathname + window.location.search;
    return <Navigate to={`/login?from=${encodeURIComponent(destino)}`} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.rol)) return <Navigate to="/" replace />;
  return children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navLinks = () => {
    const rol = user?.rol;

    if (rol === 'cliente') return [
      { to: '/cliente/menu',     icon: <UtensilsCrossed size={18}/>, label: 'Menú' },
      { to: '/cliente/pedidos',  icon: <ClipboardList size={18}/>,   label: 'Mis Pedidos' },
      { to: '/cliente/reservas', icon: <CalendarDays size={18}/>,    label: 'Reservas' },
    ];

    if (rol === 'administrador') return [
      { to: '/admin/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/admin/usuarios',  icon: <Users size={18}/>,           label: 'Usuarios' },
      { to: '/admin/productos', icon: <Coffee size={18}/>,          label: 'Productos' },
      { to: '/admin/mesas',     icon: <TableProperties size={18}/>, label: 'Mesas' },
      { to: '/admin/plano',     icon: <Map size={18}/>,             label: 'Plano' },
      { to: '/admin/pedidos',   icon: <ClipboardList size={18}/>,   label: 'Pedidos' },
      { to: '/admin/reservas',  icon: <CalendarDays size={18}/>,    label: 'Reservas' },
      { to: '/admin/reportes',  icon: <BarChart2 size={18}/>,       label: 'Reportes' },
    ];

    if (rol === 'gerente') return [
      { to: '/admin/dashboard',        icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/admin/pedidos',          icon: <ClipboardList size={18}/>,   label: 'Pedidos' },
      { to: '/admin/mesas',            icon: <TableProperties size={18}/>, label: 'Mesas' },
      { to: '/admin/plano',            icon: <Map size={18}/>,             label: 'Plano' },
      { to: '/admin/reservas',         icon: <CalendarDays size={18}/>,    label: 'Reservas' },
      { to: '/admin/reportes',         icon: <BarChart2 size={18}/>,       label: 'Reportes' },
      { to: '/trabajador/inventario',  icon: <Package size={18}/>,         label: 'Inventario' },
      { to: '/trabajador/incidencias', icon: <AlertTriangle size={18}/>,   label: 'Incidencias' },
    ];

    if (rol === 'mesero') return [
      { to: '/trabajador/dashboard',   icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/trabajador/pedidos',     icon: <ClipboardList size={18}/>,   label: 'Pedidos' },
      { to: '/trabajador/mesas',       icon: <TableProperties size={18}/>, label: 'Mesas' },
      { to: '/trabajador/reservas',    icon: <CalendarDays size={18}/>,    label: 'Reservas' },
      { to: '/trabajador/incidencias', icon: <AlertTriangle size={18}/>,   label: 'Incidencias' },
    ];

    if (rol === 'chef') return [
      { to: '/trabajador/pedidos',     icon: <ChefHat size={18}/>,         label: 'Cola Cocina' },
      { to: '/trabajador/inventario',  icon: <Package size={18}/>,         label: 'Inventario' },
      { to: '/trabajador/incidencias', icon: <AlertTriangle size={18}/>,   label: 'Incidencias' },
    ];

    if (rol === 'cajero') return [
      { to: '/trabajador/pedidos',     icon: <ClipboardList size={18}/>,   label: 'Pedidos' },
      { to: '/trabajador/mesas',       icon: <TableProperties size={18}/>, label: 'Mesas' },
      { to: '/trabajador/reservas',    icon: <CalendarDays size={18}/>,    label: 'Reservas' },
    ];

    // Trabajador genérico
    if (ROLES_TRABAJADOR.includes(rol)) return [
      { to: '/trabajador/dashboard',   icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
      { to: '/trabajador/pedidos',     icon: <ClipboardList size={18}/>,   label: 'Pedidos' },
      { to: '/trabajador/mesas',       icon: <TableProperties size={18}/>, label: 'Mesas' },
      { to: '/trabajador/inventario',  icon: <Package size={18}/>,         label: 'Inventario' },
      { to: '/trabajador/incidencias', icon: <AlertTriangle size={18}/>,   label: 'Incidencias' },
    ];

    return [];
  };

  const roleLabel = () => {
    const labels = {
      administrador: 'Administrador',
      gerente: 'Gerente',
      mesero: 'Mesero',
      chef: 'Chef',
      cajero: 'Cajero',
      trabajador: 'Trabajador',
      cliente: 'Cliente',
    };
    return labels[user?.rol] || 'Usuario';
  };

  return (
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Coffee size={28} color="#E8A830" strokeWidth={1.5} />
          <div className="sidebar-brand-text">
            <h2>Café Bar</h2>
            <p>Sistema de Gestión</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">NAVEGACIÓN</p>
          {navLinks().map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              title={collapsed ? link.label : ''}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.nombre}</p>
              <p className="sidebar-user-role">{roleLabel()}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-logout">
            <LogOut size={16}/><span className="sidebar-link-label"> Salir</span>
          </button>
        </div>
      </aside>

      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expandir menú' : 'Colapsar menú'}>
        {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
      </button>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === 'cliente') return <Navigate to="/cliente/menu" replace />;
  if (user.rol === 'chef') return <Navigate to="/trabajador/pedidos" replace />;
  if (ROLES_TRABAJADOR.includes(user.rol)) return <Navigate to="/trabajador/dashboard" replace />;
  if (ROLES_ADMIN.includes(user.rol)) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          {/* Rutas de Cliente */}
          <Route path="/cliente/menu" element={<MenuCliente />} />
          <Route path="/cliente/pedidos" element={<ProtectedRoute allowedRoles={ROLES_CLIENTE}><Layout><PedidosCliente /></Layout></ProtectedRoute>} />
          <Route path="/cliente/reservas" element={<ProtectedRoute allowedRoles={ROLES_CLIENTE}><Layout><ReservasCliente /></Layout></ProtectedRoute>} />

          {/* Rutas de Trabajador */}
          <Route path="/trabajador/dashboard"   element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><DashboardTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/pedidos"     element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><GestionPedidosTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/mesas"       element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><MesasTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/reservas"    element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR}><Layout><ReservasAdmin /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/inventario"  element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR_EXTENDED}><Layout><InventarioTrabajador /></Layout></ProtectedRoute>} />
          <Route path="/trabajador/incidencias" element={<ProtectedRoute allowedRoles={ROLES_TRABAJADOR_EXTENDED}><Layout><IncidenciasTrabajador /></Layout></ProtectedRoute>} />

          {/* Rutas de Administrador */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><DashboardAdmin /></Layout></ProtectedRoute>} />
          <Route path="/admin/usuarios"  element={<ProtectedRoute allowedRoles={['administrador']}><Layout><Usuarios /></Layout></ProtectedRoute>} />
          <Route path="/admin/productos" element={<ProtectedRoute allowedRoles={['administrador']}><Layout><Productos /></Layout></ProtectedRoute>} />
          <Route path="/admin/mesas"     element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><MesasAdmin /></Layout></ProtectedRoute>} />
          <Route path="/admin/reportes"  element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><Reportes /></Layout></ProtectedRoute>} />
          <Route path="/admin/pedidos"   element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><PedidosAdmin /></Layout></ProtectedRoute>} />
          <Route path="/admin/reservas"  element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><ReservasAdmin /></Layout></ProtectedRoute>} />
          <Route path="/admin/plano"     element={<ProtectedRoute allowedRoles={ROLES_ADMIN}><Layout><PlanoCafeteria /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
