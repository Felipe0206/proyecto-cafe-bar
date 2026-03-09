import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mesaService, pedidoService } from '../../services/api';

const COLOR_MESA = {
  disponible: { bg: '#d1fae5', border: '#10b981', text: '#065f46', label: 'Disponible' },
  ocupada:    { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d', label: 'Ocupada' },
  reservada:  { bg: '#fef9c3', border: '#f59e0b', text: '#78350f', label: 'Reservada' },
  mantenimiento: { bg: '#f3f4f6', border: '#9ca3af', text: '#374151', label: 'Mantenimiento' }
};

const EstadoMesas = () => {
  const [mesas, setMesas] = useState([]);
  const [pedidosPorMesa, setPedidosPorMesa] = useState({});
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const [mesasRes, pedidosRes] = await Promise.all([
        mesaService.getAll(),
        pedidoService.getAll()
      ]);
      const mesas = mesasRes.data.data || [];
      const pedidos = pedidosRes.data.data || [];

      // Agrupar pedidos activos por mesa
      const activos = {};
      pedidos.filter(p => ['pendiente', 'en_preparacion', 'listo'].includes(p.estado))
        .forEach(p => {
          if (!activos[p.idMesa]) activos[p.idMesa] = [];
          activos[p.idMesa].push(p);
        });

      setMesas(mesas);
      setPedidosPorMesa(activos);
    } catch (e) {
      console.error('Error cargando mesas:', e);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (mesa, nuevoEstado) => {
    setActualizando(mesa.idMesa);
    try {
      await mesaService.update({ idMesa: String(mesa.idMesa), estado: nuevoEstado, capacidad: String(mesa.capacidad), ubicacion: mesa.ubicacion });
      await cargarDatos();
    } catch (e) {
      alert('Error al actualizar la mesa');
    } finally {
      setActualizando(null);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando mesas...</div>;

  const resumen = {
    disponibles: mesas.filter(m => m.estado === 'disponible').length,
    ocupadas: mesas.filter(m => m.estado === 'ocupada').length,
    reservadas: mesas.filter(m => m.estado === 'reservada').length,
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/trabajador/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🪑 Estado de Mesas</h1>
        </div>
        <button onClick={cargarDatos} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
          🔄 Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Disponibles', value: resumen.disponibles, color: '#10b981' },
          { label: 'Ocupadas', value: resumen.ocupadas, color: '#ef4444' },
          { label: 'Reservadas', value: resumen.reservadas, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '10px', padding: '1rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid de Mesas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {mesas.sort((a, b) => a.numeroMesa - b.numeroMesa).map(mesa => {
          const colores = COLOR_MESA[mesa.estado] || COLOR_MESA.disponible;
          const pedidosActivos = pedidosPorMesa[mesa.idMesa] || [];
          const enEspera = actualizando === mesa.idMesa;

          return (
            <div key={mesa.idMesa} style={{
              background: colores.bg, border: `2px solid ${colores.border}`,
              borderRadius: '12px', padding: '1.25rem',
              opacity: enEspera ? 0.6 : 1, transition: 'opacity 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: colores.text }}>Mesa {mesa.numeroMesa}</div>
                  <div style={{ fontSize: '0.82rem', color: colores.text, opacity: 0.8 }}>{mesa.capacidad} personas · {mesa.ubicacion}</div>
                </div>
                <span style={{ background: colores.border, color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '0.78rem' }}>
                  {colores.label}
                </span>
              </div>

              {pedidosActivos.length > 0 && (
                <div style={{ marginBottom: '0.75rem', fontSize: '0.83rem', color: colores.text }}>
                  {pedidosActivos.map(p => (
                    <div key={p.idPedido} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>#{p.codigoPedido}</span>
                      <span style={{ fontWeight: 'bold' }}>{p.estado}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {mesa.estado !== 'disponible' && (
                  <button
                    onClick={() => cambiarEstado(mesa, 'disponible')}
                    disabled={enEspera}
                    style={{ flex: 1, padding: '0.4rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Liberar
                  </button>
                )}
                {mesa.estado === 'disponible' && (
                  <button
                    onClick={() => cambiarEstado(mesa, 'ocupada')}
                    disabled={enEspera}
                    style={{ flex: 1, padding: '0.4rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Marcar Ocupada
                  </button>
                )}
                {mesa.estado === 'disponible' && (
                  <button
                    onClick={() => cambiarEstado(mesa, 'reservada')}
                    disabled={enEspera}
                    style={{ flex: 1, padding: '0.4rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Reservar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EstadoMesas;
