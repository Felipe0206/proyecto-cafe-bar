import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService, mesaService } from '../../services/api';
import './Dashboard.css';

/**
 * Dashboard para Trabajadores
 * Replica funcionalidad de views/trabajador/dashboard.html
 * Muestra estadísticas del día y actividad reciente
 */
const DashboardTrabajador = () => {
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
    // Actualizar cada minuto
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
        pedidosCompletados: pedidos.filter(p =>
          p.estado === 'entregado'
        ).length,
        mesasOcupadas: mesas.filter(m => m.estado === 'ocupada').length,
        incidenciasAbiertas: 0 // TODO: implementar
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

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard-trabajador">
      <header>
        <h1>📊 Dashboard del Trabajador</h1>
        <button className="btn-refresh" onClick={cargarDatos}>
          🔄 Actualizar
        </button>
      </header>

      {/* Tarjetas de Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card stat-warning">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.pedidosActivos}</h3>
            <p>Pedidos Activos</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.pedidosCompletados}</h3>
            <p>Completados Hoy</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🪑</div>
          <div className="stat-info">
            <h3>{stats.mesasOcupadas}</h3>
            <p>Mesas Ocupadas</p>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.incidenciasAbiertas}</h3>
            <p>Incidencias Abiertas</p>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="actividad-reciente">
        <h2>Actividad Reciente</h2>
        <div className="pedidos-lista">
          {pedidosRecientes.map(pedido => (
            <div key={pedido.idPedido} className="pedido-item">
              <div className="pedido-info">
                <span className="numero">#{pedido.numeroPedido}</span>
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

      {/* Acciones Rápidas */}
      <div className="acciones-rapidas">
        <h2>Acciones Rápidas</h2>
        <div className="acciones-grid">
          <Link to="/trabajador/pedidos" className="accion-card">
            <span>📋</span>
            <p>Gestionar Pedidos</p>
          </Link>
          <Link to="/trabajador/inventario" className="accion-card">
            <span>📦</span>
            <p>Ver Inventario</p>
          </Link>
          <Link to="/trabajador/mesas" className="accion-card">
            <span>🪑</span>
            <p>Estado de Mesas</p>
          </Link>
          <Link to="/trabajador/incidencias" className="accion-card">
            <span>⚠️</span>
            <p>Reportar Incidencia</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardTrabajador;
