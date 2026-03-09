import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService, usuarioService, mesaService, productoService } from '../../services/api';
import './Dashboard.css';

/**
 * Dashboard para Administradores
 * Replica funcionalidad de views/administrador/dashboard.html
 * Muestra analytics completos del negocio
 */
const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    ventasHoy: 0,
    pedidosHoy: 0,
    clientesActivos: 0,
    promedioTicket: 0
  });
  const [topProductos, setTopProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, usuariosRes, mesasRes, productosRes] = await Promise.all([
        pedidoService.getAll(),
        usuarioService.getAll(),
        mesaService.getAll(),
        productoService.getAll()
      ]);

      const pedidos = pedidosRes.data.data || [];
      const hoy = new Date().toDateString();
      const pedidosHoy = pedidos.filter(p =>
        new Date(p.fechaPedido).toDateString() === hoy
      );

      const ventasHoy = pedidosHoy
        .filter(p => p.estado === 'entregado')
        .reduce((sum, p) => sum + parseFloat(p.total), 0);

      setStats({
        ventasHoy,
        pedidosHoy: pedidosHoy.length,
        clientesActivos: (usuariosRes.data.data || []).filter(u =>
          u.rol === 'cliente' && u.activo
        ).length,
        promedioTicket: pedidosHoy.length > 0 ? ventasHoy / pedidosHoy.length : 0
      });

      // Top productos (simulado)
      setTopProductos(productosRes.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard-admin">
      <header>
        <h1>📊 Panel de Control - Administrador</h1>
        <button className="btn-refresh" onClick={cargarDatos}>
          🔄 Actualizar
        </button>
      </header>

      {/* KPIs Principales */}
      <div className="kpis-grid">
        <div className="kpi-card kpi-success">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>${stats.ventasHoy.toLocaleString()}</h3>
            <p>Ventas de Hoy</p>
          </div>
        </div>

        <div className="kpi-card kpi-info">
          <div className="kpi-icon">📋</div>
          <div className="kpi-content">
            <h3>{stats.pedidosHoy}</h3>
            <p>Pedidos de Hoy</p>
          </div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>{stats.clientesActivos}</h3>
            <p>Clientes Activos</p>
          </div>
        </div>

        <div className="kpi-card kpi-primary">
          <div className="kpi-icon">💵</div>
          <div className="kpi-content">
            <h3>${stats.promedioTicket.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
            <p>Ticket Promedio</p>
          </div>
        </div>
      </div>

      {/* Productos Más Vendidos */}
      <div className="top-productos">
        <h2>Productos Más Vendidos</h2>
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {topProductos.map(producto => (
              <tr key={producto.idProducto}>
                <td>{producto.nombre}</td>
                <td>Cat. {producto.categoriaId}</td>
                <td>${producto.precio.toLocaleString()}</td>
                <td>{producto.stock}</td>
                <td>
                  <span className={`badge ${producto.disponible ? 'success' : 'danger'}`}>
                    {producto.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Módulos de Gestión */}
      <div className="modulos-gestion">
        <h2>Gestión del Sistema</h2>
        <div className="modulos-grid">
          <Link to="/admin/usuarios" className="modulo-card">
            <span>👥</span>
            <h3>Usuarios</h3>
            <p>Gestionar usuarios del sistema</p>
          </Link>
          <Link to="/admin/productos" className="modulo-card">
            <span>🍽️</span>
            <h3>Productos</h3>
            <p>Administrar menú y precios</p>
          </Link>
          <Link to="/admin/mesas" className="modulo-card">
            <span>🪑</span>
            <h3>Mesas</h3>
            <p>Configurar mesas y QR</p>
          </Link>
          <Link to="/admin/reportes" className="modulo-card">
            <span>📊</span>
            <h3>Reportes</h3>
            <p>Análisis y reportes</p>
          </Link>
          <Link to="/admin/pedidos" className="modulo-card">
            <span>📋</span>
            <h3>Pedidos</h3>
            <p>Ver todos los pedidos</p>
          </Link>
          <Link to="/admin/reservas" className="modulo-card">
            <span>📅</span>
            <h3>Reservas</h3>
            <p>Gestionar reservas</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
