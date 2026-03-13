import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService, usuarioService, mesaService, productoService } from '../../services/api';
import { TrendingUp, ClipboardList, Users, DollarSign, RefreshCw, TableProperties, CalendarDays, BarChart2, Coffee } from 'lucide-react';
import './Dashboard.css';
import '../modulos.css';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({ ventasHoy: 0, pedidosHoy: 0, clientesActivos: 0, promedioTicket: 0 });
  const [topProductos, setTopProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, usuariosRes, mesasRes, productosRes] = await Promise.all([
        pedidoService.getAll(), usuarioService.getAll(), mesaService.getAll(), productoService.getAll()
      ]);
      const pedidos = pedidosRes.data.data || [];
      const hoy = new Date().toDateString();
      const pedidosHoy = pedidos.filter(p => new Date(p.fechaPedido).toDateString() === hoy);
      const ventasHoy = pedidosHoy.filter(p => p.estado === 'entregado').reduce((sum, p) => sum + parseFloat(p.total), 0);
      setStats({
        ventasHoy,
        pedidosHoy: pedidosHoy.length,
        clientesActivos: (usuariosRes.data.data || []).filter(u => u.rol === 'cliente' && u.activo).length,
        promedioTicket: pedidosHoy.length > 0 ? ventasHoy / pedidosHoy.length : 0
      });
      setTopProductos(productosRes.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;

  return (
    <div className="dashboard-admin">
      <header>
        <h1>Panel de Control</h1>
        <button className="btn btn-primary" onClick={cargarDatos} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </header>

      <div className="kpis-grid">
        <div className="kpi-card kpi-success">
          <div className="kpi-icon"><TrendingUp size={36} color="#27ae60" /></div>
          <div className="kpi-content">
            <h3>${stats.ventasHoy.toLocaleString()}</h3>
            <p>Ventas de Hoy</p>
          </div>
        </div>
        <div className="kpi-card kpi-info">
          <div className="kpi-icon"><ClipboardList size={36} color="#3498db" /></div>
          <div className="kpi-content">
            <h3>{stats.pedidosHoy}</h3>
            <p>Pedidos de Hoy</p>
          </div>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-icon"><Users size={36} color="#E8A830" /></div>
          <div className="kpi-content">
            <h3>{stats.clientesActivos}</h3>
            <p>Clientes Activos</p>
          </div>
        </div>
        <div className="kpi-card kpi-primary">
          <div className="kpi-icon"><DollarSign size={36} color="#C8862A" /></div>
          <div className="kpi-content">
            <h3>${stats.promedioTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p>Ticket Promedio</p>
          </div>
        </div>
      </div>

      <div className="top-productos">
        <h2>Productos en el Menú</h2>
        <table className="modulo-tabla">
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
                  <span className="estado-badge" style={{ background: producto.disponible ? '#d1fae5' : '#fee2e2', color: producto.disponible ? '#065f46' : '#7f1d1d' }}>
                    {producto.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="modulos-gestion">
        <h2>Gestión del Sistema</h2>
        <div className="modulos-grid">
          <Link to="/admin/usuarios" className="modulo-card">
            <Users size={32} color="#E8A830" />
            <div><h3>Usuarios</h3><p>Gestionar usuarios del sistema</p></div>
          </Link>
          <Link to="/admin/productos" className="modulo-card">
            <Coffee size={32} color="#E8A830" />
            <div><h3>Productos</h3><p>Administrar menú y precios</p></div>
          </Link>
          <Link to="/admin/mesas" className="modulo-card">
            <TableProperties size={32} color="#E8A830" />
            <div><h3>Mesas</h3><p>Configurar mesas y QR</p></div>
          </Link>
          <Link to="/admin/reportes" className="modulo-card">
            <BarChart2 size={32} color="#E8A830" />
            <div><h3>Reportes</h3><p>Análisis y reportes</p></div>
          </Link>
          <Link to="/admin/pedidos" className="modulo-card">
            <ClipboardList size={32} color="#E8A830" />
            <div><h3>Pedidos</h3><p>Ver todos los pedidos</p></div>
          </Link>
          <Link to="/admin/reservas" className="modulo-card">
            <CalendarDays size={32} color="#E8A830" />
            <div><h3>Reservas</h3><p>Gestionar reservas</p></div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
