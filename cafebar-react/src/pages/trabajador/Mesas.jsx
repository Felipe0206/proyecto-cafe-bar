import { useState, useEffect } from 'react';
import { mesaService, pedidoService } from '../../services/api';
import { RefreshCw, Users, MapPin } from 'lucide-react';
import '../modulos.css';

const COLOR_MESA = {
  disponible:    { bg: '#d1fae5', border: '#27ae60', text: '#065f46', label: 'Disponible' },
  ocupada:       { bg: '#fee2e2', border: '#e74c3c', text: '#7f1d1d', label: 'Ocupada' },
  reservada:     { bg: '#FDF3E0', border: '#E8A830', text: '#7A5010', label: 'Reservada' },
  mantenimiento: { bg: '#F7F3EE', border: '#888',    text: '#555',    label: 'Mantenimiento' }
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
      const [mesasRes, pedidosRes] = await Promise.all([mesaService.getAll(), pedidoService.getAll()]);
      const mesas = mesasRes.data.data || [];
      const pedidos = pedidosRes.data.data || [];
      const activos = {};
      pedidos.filter(p => ['pendiente', 'en_preparacion', 'listo'].includes(p.estado))
        .forEach(p => { if (!activos[p.idMesa]) activos[p.idMesa] = []; activos[p.idMesa].push(p); });
      setMesas(mesas);
      setPedidosPorMesa(activos);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const cambiarEstado = async (mesa, nuevoEstado) => {
    setActualizando(mesa.idMesa);
    try { await mesaService.update({ idMesa: String(mesa.idMesa), estado: nuevoEstado, capacidad: String(mesa.capacidad), ubicacion: mesa.ubicacion }); await cargarDatos(); }
    catch (e) { alert('Error al actualizar la mesa'); }
    finally { setActualizando(null); }
  };

  if (loading) return <div className="modulo-loading">Cargando mesas...</div>;

  const resumen = {
    disponibles: mesas.filter(m => m.estado === 'disponible').length,
    ocupadas:    mesas.filter(m => m.estado === 'ocupada').length,
    reservadas:  mesas.filter(m => m.estado === 'reservada').length,
  };

  return (
    <div>
      <div className="modulo-header">
        <h1>Estado de Mesas</h1>
        <button onClick={cargarDatos} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      <div className="resumen-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'Disponibles', value: resumen.disponibles, color: '#27ae60' },
          { label: 'Ocupadas',    value: resumen.ocupadas,    color: '#e74c3c' },
          { label: 'Reservadas',  value: resumen.reservadas,  color: '#E8A830' },
        ].map(s => (
          <div key={s.label} className="resumen-card" style={{ borderTopColor: s.color }}>
            <div className="resumen-card-valor" style={{ color: s.color }}>{s.value}</div>
            <div className="resumen-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cards-grid">
        {mesas.sort((a, b) => a.numeroMesa - b.numeroMesa).map(mesa => {
          const c = COLOR_MESA[mesa.estado] || COLOR_MESA.disponible;
          const pedidosActivos = pedidosPorMesa[mesa.idMesa] || [];
          const enEspera = actualizando === mesa.idMesa;

          return (
            <div key={mesa.idMesa} style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: '12px', padding: '1.25rem', opacity: enEspera ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: c.text }}>Mesa {mesa.numeroMesa}</div>
                  <div style={{ fontSize: '0.82rem', color: c.text, opacity: 0.75, display: 'flex', gap: '0.6rem', marginTop: '2px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Users size={11} />{mesa.capacidad} pers.</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} />{mesa.ubicacion}</span>
                  </div>
                </div>
                <span className="estado-badge" style={{ background: c.border, color: 'white' }}>{c.label}</span>
              </div>

              {pedidosActivos.length > 0 && (
                <div style={{ marginBottom: '0.75rem', fontSize: '0.83rem', color: c.text }}>
                  {pedidosActivos.map(p => (
                    <div key={p.idPedido} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>#{p.codigoPedido}</span>
                      <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{p.estado}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {mesa.estado !== 'disponible' && (
                  <button onClick={() => cambiarEstado(mesa, 'disponible')} disabled={enEspera} className="btn-accion" style={{ flex: 1, background: '#27ae60' }}>Liberar</button>
                )}
                {mesa.estado === 'disponible' && (
                  <button onClick={() => cambiarEstado(mesa, 'ocupada')} disabled={enEspera} className="btn-accion" style={{ flex: 1, background: '#e74c3c' }}>Marcar Ocupada</button>
                )}
                {mesa.estado === 'disponible' && (
                  <button onClick={() => cambiarEstado(mesa, 'reservada')} disabled={enEspera} className="btn-accion" style={{ flex: 1, background: '#E8A830' }}>Reservar</button>
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
