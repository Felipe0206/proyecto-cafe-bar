import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService, mesaService, productoService, usuarioService } from '../../services/api';

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

      // Pedidos por estado
      const porEstado = {};
      pedidos.forEach(p => { porEstado[p.estado] = (porEstado[p.estado] || 0) + 1; });

      // Ingresos por mesa
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Generando reportes...</div>;
  if (!datos) return null;

  const { pedidosHoy, ventasHoy, ventasTotales, porEstado, topMesas, mesas, productos, usuarios, entregadosHoy, entregados } = datos;

  const KPI = ({ icon, label, value, sub, color }) => (
    <div style={{ background: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📊 Reportes y Estadísticas</h1>
        </div>
        <button onClick={cargarDatos} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
          🔄 Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KPI icon="💰" label="Ventas Hoy" value={`$${ventasHoy.toLocaleString()}`} sub={`${entregadosHoy.length} pedidos entregados`} color="#10b981" />
        <KPI icon="📋" label="Pedidos Hoy" value={pedidosHoy.length} sub="pedidos recibidos" color="#2563eb" />
        <KPI icon="💵" label="Ventas Totales" value={`$${ventasTotales.toLocaleString()}`} sub={`${entregados.length} pedidos completados`} color="#7c3aed" />
        <KPI icon="🪑" label="Mesas" value={mesas.length} sub={`${mesas.filter(m => m.estado === 'disponible').length} disponibles`} color="#f59e0b" />
        <KPI icon="🍽️" label="Productos" value={productos.length} sub={`${productos.filter(p => p.disponible).length} activos`} color="#06b6d4" />
        <KPI icon="👥" label="Usuarios" value={usuarios.length} sub="registrados en sistema" color="#ec4899" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Pedidos por Estado */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#374151' }}>Pedidos por Estado</h3>
          {Object.entries(porEstado).length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center' }}>Sin pedidos registrados</p>
          ) : (
            Object.entries(porEstado).map(([estado, count]) => {
              const total = Object.values(porEstado).reduce((s, v) => s + v, 0);
              const pct = Math.round((count / total) * 100);
              const colores = { pendiente: '#f59e0b', en_preparacion: '#3b82f6', listo: '#10b981', entregado: '#6b7280', cancelado: '#ef4444' };
              const color = colores[estado] || '#9ca3af';
              return (
                <div key={estado} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                    <span style={{ textTransform: 'capitalize', color: '#374151' }}>{estado.replace('_', ' ')}</span>
                    <span style={{ fontWeight: '600' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Top Mesas por Ingresos */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#374151' }}>Ingresos por Mesa</h3>
          {topMesas.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center' }}>Sin datos de ventas</p>
          ) : (
            topMesas.map(([mesa, total], i) => (
              <div key={mesa} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < topMesas.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '24px', height: '24px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 'bold' }}>{i + 1}</span>
                  <span style={{ fontWeight: '500' }}>{mesa}</span>
                </div>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>${total.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>

        {/* Usuarios por Rol */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#374151' }}>Usuarios por Rol</h3>
          {['administrador', 'gerente', 'mesero', 'chef', 'cajero'].map(rol => {
            const count = usuarios.filter(u => u.rol === rol).length;
            return (
              <div key={rol} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ textTransform: 'capitalize', color: '#374151' }}>{rol}</span>
                <span style={{ fontWeight: '600', color: '#2563eb' }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Mesas por Ubicación */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#374151' }}>Mesas por Ubicación</h3>
          {['interior', 'terraza', 'privado', 'barra'].map(ub => {
            const count = mesas.filter(m => m.ubicacion === ub).length;
            if (count === 0) return null;
            return (
              <div key={ub} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f9fafb' }}>
                <span style={{ textTransform: 'capitalize', color: '#374151' }}>📍 {ub}</span>
                <span style={{ fontWeight: '600', color: '#2563eb' }}>{count} mesas</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
