import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservaService } from '../../services/api';

const COLOR_ESTADO = { pendiente: '#f59e0b', confirmada: '#10b981', cancelada: '#ef4444', completada: '#6b7280' };

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { const r = await reservaService.getAll(); setReservas(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const confirmar = async (r) => {
    try { await reservaService.confirmar(r.idReserva); await cargar(); }
    catch (e) { alert('Error al confirmar'); }
  };

  const cancelar = async (r) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    try { await reservaService.cancelar(r.idReserva); await cargar(); }
    catch (e) { alert('Error al cancelar'); }
  };

  const filtradas = filtro === 'todas' ? reservas : reservas.filter(r => r.estado === filtro);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando reservas...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📅 Gestión de Reservas</h1>
        </div>
        <button onClick={cargar} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>🔄</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['todas', 'pendiente', 'confirmada', 'cancelada', 'completada'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: filtro === f ? '#2563eb' : '#f1f5f9', color: filtro === f ? 'white' : '#374151' }}>
            {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)} ({(f === 'todas' ? reservas : reservas.filter(r => r.estado === f)).length})
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', color: '#9ca3af' }}>
          No hay reservas
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtradas.sort((a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva)).map(r => (
            <div key={r.idReserva} style={{ background: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${COLOR_ESTADO[r.estado] || '#9ca3af'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{r.codigoConfirmacion}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>Mesa {r.idMesa}</div>
                </div>
                <span style={{ background: COLOR_ESTADO[r.estado] + '22', color: COLOR_ESTADO[r.estado], padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
                  {r.estado}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#4b5563', marginBottom: '0.75rem' }}>
                <div>📅 {r.fechaReserva} · {r.horaReserva}</div>
                <div>👥 {r.numeroPersonas} personas</div>
                {r.duracionEstimada > 0 && <div>⏱️ {r.duracionEstimada} min estimados</div>}
                {r.motivo && <div>📝 {r.motivo}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {r.estado === 'pendiente' && (
                  <button onClick={() => confirmar(r)}
                    style={{ flex: 1, padding: '0.4rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Confirmar
                  </button>
                )}
                {['pendiente', 'confirmada'].includes(r.estado) && (
                  <button onClick={() => cancelar(r)}
                    style={{ flex: 1, padding: '0.4rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservasAdmin;
