import { useState, useEffect } from 'react';
import { pedidoService, mesaService, productoService, usuarioService } from '../../services/api';
import { TrendingUp, ClipboardList, DollarSign, TableProperties, Coffee, Users, RefreshCw, MapPin } from 'lucide-react';
import './Reportes.css';

const Reportes = () => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [pedidosRes, mesasRes, productosRes, usuariosRes] = await Promise.all([
        pedidoService.getAll(), mesaService.getAll(), productoService.getAll(), usuarioService.getAll()
      ]);
      const pedidos = pedidosRes.data.data || [];
      const mesas = mesasRes.data.data || [];
      const productos = productosRes.data.data || [];
      const usuarios = usuariosRes.data.data || [];
      const hoy = new Date().toDateString();
      const pedidosHoy = pedidos.filter(p => new Date(p.fechaPedido).toDateString() === hoy);
      const entregados = pedidos.filter(p => p.estado === 'entregado');
      const entregadosHoy = pedidosHoy.filter(p => p.estado === 'entregado');
      const ventasHoy = entregadosHoy.reduce((s, p) => s + parseFloat(p.total || 0), 0);
      const ventasTotales = entregados.reduce((s, p) => s + parseFloat(p.total || 0), 0);
      const porEstado = {};
      pedidos.forEach(p => { porEstado[p.estado] = (porEstado[p.estado] || 0) + 1; });
      const ingresosPorMesa = {};
      entregados.forEach(p => {
        const key = `Mesa ${p.idMesa}`;
        ingresosPorMesa[key] = (ingresosPorMesa[key] || 0) + parseFloat(p.total || 0);
      });
      const topMesas = Object.entries(ingresosPorMesa).sort((a, b) => b[1] - a[1]).slice(0, 5);
      setDatos({ pedidos, pedidosHoy, ventasHoy, ventasTotales, porEstado, topMesas, mesas, productos, usuarios, entregadosHoy, entregados });
    } catch (e) {
      console.error('Error cargando reportes:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Generando reportes...</div>;
  if (!datos) return null;

  const { pedidosHoy, ventasHoy, ventasTotales, porEstado, topMesas, mesas, productos, usuarios, entregadosHoy, entregados } = datos;

  const coloresEstado = {
    pendiente: '#E8A830',
    en_preparacion: '#3b82f6',
    listo: '#27ae60',
    entregado: '#888',
    cancelado: '#e74c3c'
  };

  return (
    <div className="reportes-container">

      <div className="reportes-header">
        <h1>Reportes y Estadísticas</h1>
        <button onClick={cargarDatos} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="reportes-kpis">
        <div className="reporte-kpi-card">
          <div className="reporte-kpi-icon" style={{ background: 'rgba(200,134,42,0.15)' }}>
            <TrendingUp size={24} color="#C8862A" />
          </div>
          <div>
            <p className="reporte-kpi-value">${ventasHoy.toLocaleString()}</p>
            <p className="reporte-kpi-label">Ventas Hoy</p>
            <p className="reporte-kpi-sub">{entregadosHoy.length} pedidos entregados</p>
          </div>
        </div>

        <div className="reporte-kpi-card">
          <div className="reporte-kpi-icon" style={{ background: 'rgba(52,152,219,0.15)' }}>
            <ClipboardList size={24} color="#3498db" />
          </div>
          <div>
            <p className="reporte-kpi-value">{pedidosHoy.length}</p>
            <p className="reporte-kpi-label">Pedidos Hoy</p>
            <p className="reporte-kpi-sub">pedidos recibidos</p>
          </div>
        </div>

        <div className="reporte-kpi-card">
          <div className="reporte-kpi-icon" style={{ background: 'rgba(39,174,96,0.15)' }}>
            <DollarSign size={24} color="#27ae60" />
          </div>
          <div>
            <p className="reporte-kpi-value">${ventasTotales.toLocaleString()}</p>
            <p className="reporte-kpi-label">Ventas Totales</p>
            <p className="reporte-kpi-sub">{entregados.length} pedidos completados</p>
          </div>
        </div>

        <div className="reporte-kpi-card">
          <div className="reporte-kpi-icon" style={{ background: 'rgba(28,16,8,0.1)' }}>
            <TableProperties size={24} color="#1C1008" />
          </div>
          <div>
            <p className="reporte-kpi-value">{mesas.length}</p>
            <p className="reporte-kpi-label">Mesas</p>
            <p className="reporte-kpi-sub">{mesas.filter(m => m.estado === 'disponible').length} disponibles</p>
          </div>
        </div>

        <div className="reporte-kpi-card">
          <div className="reporte-kpi-icon" style={{ background: 'rgba(200,134,42,0.1)' }}>
            <Coffee size={24} color="#C8862A" />
          </div>
          <div>
            <p className="reporte-kpi-value">{productos.length}</p>
            <p className="reporte-kpi-label">Productos</p>
            <p className="reporte-kpi-sub">{productos.filter(p => p.disponible).length} activos</p>
          </div>
        </div>

        <div className="reporte-kpi-card">
          <div className="reporte-kpi-icon" style={{ background: 'rgba(52,152,219,0.1)' }}>
            <Users size={24} color="#3498db" />
          </div>
          <div>
            <p className="reporte-kpi-value">{usuarios.length}</p>
            <p className="reporte-kpi-label">Usuarios</p>
            <p className="reporte-kpi-sub">registrados en sistema</p>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="reportes-grid">

        {/* Pedidos por Estado */}
        <div className="reporte-card">
          <h3>Pedidos por Estado</h3>
          {Object.entries(porEstado).length === 0 ? (
            <p className="reporte-empty">Sin pedidos registrados</p>
          ) : (
            Object.entries(porEstado).map(([estado, count]) => {
              const total = Object.values(porEstado).reduce((s, v) => s + v, 0);
              const pct = Math.round((count / total) * 100);
              const color = coloresEstado[estado] || '#9ca3af';
              return (
                <div key={estado} className="reporte-bar-item">
                  <div className="reporte-bar-label">
                    <span>{estado.replace('_', ' ')}</span>
                    <span className="reporte-bar-count">{count} ({pct}%)</span>
                  </div>
                  <div className="reporte-bar-track">
                    <div className="reporte-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ingresos por Mesa */}
        <div className="reporte-card">
          <h3>Ingresos por Mesa</h3>
          {topMesas.length === 0 ? (
            <p className="reporte-empty">Sin datos de ventas</p>
          ) : (
            topMesas.map(([mesa, total], i) => (
              <div key={mesa} className="reporte-list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="reporte-rank">{i + 1}</span>
                  <span>{mesa}</span>
                </div>
                <span className="reporte-amount">${total.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>

        {/* Usuarios por Rol */}
        <div className="reporte-card">
          <h3>Usuarios por Rol</h3>
          {['administrador', 'gerente', 'mesero', 'chef', 'cajero'].map(rol => {
            const count = usuarios.filter(u => u.rol === rol).length;
            return (
              <div key={rol} className="reporte-list-item">
                <span style={{ textTransform: 'capitalize' }}>{rol}</span>
                <span className="reporte-count">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Mesas por Ubicación */}
        <div className="reporte-card">
          <h3>Mesas por Ubicación</h3>
          {['interior', 'terraza', 'privado', 'barra'].map(ub => {
            const count = mesas.filter(m => m.ubicacion === ub).length;
            if (count === 0) return null;
            return (
              <div key={ub} className="reporte-list-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
                  <MapPin size={14} color="#C8862A" />{ub}
                </span>
                <span className="reporte-count">{count} mesas</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Reportes;
