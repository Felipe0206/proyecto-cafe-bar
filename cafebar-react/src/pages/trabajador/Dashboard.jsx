import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pedidoService, mesaService } from '../../services/api';
import { ClipboardList, CheckCircle, AlertTriangle, RefreshCw, Package, Armchair, CalendarDays, ChefHat } from 'lucide-react';
import '../administrador/Dashboard.css';
import '../modulos.css';

const ACCIONES_POR_ROL = {
  mesero: [
    { to: '/trabajador/pedidos',     icon: <ClipboardList size={32} color="#E8A830" />, titulo: 'Pedidos',     desc: 'Gestionar pedidos' },
    { to: '/trabajador/mesas',       icon: <Armchair size={32} color="#E8A830" />,      titulo: 'Mesas',       desc: 'Estado de mesas' },
    { to: '/trabajador/reservas',    icon: <CalendarDays size={32} color="#E8A830" />,  titulo: 'Reservas',    desc: 'Gestionar reservas' },
    { to: '/trabajador/incidencias', icon: <AlertTriangle size={32} color="#E8A830" />, titulo: 'Incidencias', desc: 'Reportar incidencia' },
  ],
  cajero: [
    { to: '/trabajador/pedidos',  icon: <ClipboardList size={32} color="#E8A830" />, titulo: 'Pedidos',  desc: 'Gestionar pedidos' },
    { to: '/trabajador/mesas',    icon: <Armchair size={32} color="#E8A830" />,      titulo: 'Mesas',    desc: 'Estado de mesas' },
    { to: '/trabajador/reservas', icon: <CalendarDays size={32} color="#E8A830" />,  titulo: 'Reservas', desc: 'Gestionar reservas' },
  ],
};

const TITULOS_ROL = {
  mesero: 'Dashboard del Mesero',
  cajero: 'Dashboard del Cajero',
  trabajador: 'Dashboard del Trabajador',
};

const DashboardTrabajador = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pedidosActivos: 0,
    pedidosCompletados: 0,
    mesasOcupadas: 0,
    incidenciasAbiertas: 0
  });
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 60000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const [pedidosRes, mesasRes] = await Promise.all([
        pedidoService.getAll(),
        mesaService.getAll()
      ]);

      const pedidos = pedidosRes.data.data || [];
      const mesas = mesasRes.data.data || [];

      setStats({
        pedidosActivos: pedidos.filter(p =>
          p.estado === 'pendiente' || p.estado === 'en_preparacion'
        ).length,
        pedidosCompletados: pedidos.filter(p => p.estado === 'entregado').length,
        mesasOcupadas: mesas.filter(m => m.estado === 'ocupada').length,
        incidenciasAbiertas: 0
      });

      setPedidosRecientes(
        pedidos
          .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
          .slice(0, 10)
      );
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;

  const rol = user?.rol;
  const titulo = TITULOS_ROL[rol] || 'Dashboard';
  const acciones = ACCIONES_POR_ROL[rol] || [
    { to: '/trabajador/pedidos',     icon: <ClipboardList size={32} color="#E8A830" />, titulo: 'Pedidos',     desc: 'Gestionar pedidos' },
    { to: '/trabajador/inventario',  icon: <Package size={32} color="#E8A830" />,       titulo: 'Inventario',  desc: 'Ver inventario' },
    { to: '/trabajador/mesas',       icon: <Armchair size={32} color="#E8A830" />,      titulo: 'Mesas',       desc: 'Estado de mesas' },
    { to: '/trabajador/incidencias', icon: <AlertTriangle size={32} color="#E8A830" />, titulo: 'Incidencias', desc: 'Reportar incidencia' },
  ];

  return (
    <div className="dashboard-trabajador">
      <header>
        <h1>{titulo}</h1>
        <button className="btn btn-primary" onClick={cargarDatos} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </header>

      <div className="kpis-grid">
        <div className="kpi-card kpi-warning">
          <div className="kpi-icon"><ClipboardList size={36} color="#E8A830" /></div>
          <div className="kpi-content">
            <h3>{stats.pedidosActivos}</h3>
            <p>Pedidos Activos</p>
          </div>
        </div>
        <div className="kpi-card kpi-success">
          <div className="kpi-icon"><CheckCircle size={36} color="#27ae60" /></div>
          <div className="kpi-content">
            <h3>{stats.pedidosCompletados}</h3>
            <p>Completados Hoy</p>
          </div>
        </div>
        <div className="kpi-card kpi-info">
          <div className="kpi-icon"><Armchair size={36} color="#3498db" /></div>
          <div className="kpi-content">
            <h3>{stats.mesasOcupadas}</h3>
            <p>Mesas Ocupadas</p>
          </div>
        </div>
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon"><AlertTriangle size={36} color="#e74c3c" /></div>
          <div className="kpi-content">
            <h3>{stats.incidenciasAbiertas}</h3>
            <p>Incidencias Abiertas</p>
          </div>
        </div>
      </div>

      <div className="actividad-reciente">
        <h2>Actividad Reciente</h2>
        <div className="pedidos-lista">
          {pedidosRecientes.length === 0 && (
            <p style={{ color: '#888', padding: '1rem 0' }}>No hay pedidos recientes.</p>
          )}
          {pedidosRecientes.map(pedido => (
            <div key={pedido.idPedido} className="pedido-item">
              <div className="pedido-info">
                <span className="numero">#{pedido.numeroPedido || pedido.idPedido}</span>
                <span className="mesa">Mesa {pedido.idMesa}</span>
              </div>
              <div className="pedido-detalles">
                <span className="hora">
                  {new Date(pedido.fechaPedido).toLocaleTimeString()}
                </span>
                <span className={`estado ${pedido.estado}`}>
                  {pedido.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="modulos-gestion">
        <h2>Acciones Rápidas</h2>
        <div className="modulos-grid">
          {acciones.map(a => (
            <Link key={a.to} to={a.to} className="modulo-card">
              {a.icon}
              <div><h3>{a.titulo}</h3><p>{a.desc}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTrabajador;
