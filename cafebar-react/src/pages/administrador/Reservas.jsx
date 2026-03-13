import { useState, useEffect } from 'react';
import { reservaService } from '../../services/api';
import { RefreshCw, CalendarDays, Users, Clock } from 'lucide-react';
import '../modulos.css';

const COLOR_ESTADO = { pendiente: '#E8A830', confirmada: '#27ae60', cancelada: '#e74c3c', completada: '#888' };

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

  if (loading) return <div className="modulo-loading">Cargando reservas...</div>;

  return (
    <div>
      <div className="modulo-header">
        <h1>Gestión de Reservas</h1>
        <button onClick={cargar} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      <div className="modulo-filtros">
        {['todas', 'pendiente', 'confirmada', 'cancelada', 'completada'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`modulo-filtro-btn${filtro === f ? ' activo' : ''}`}>
            {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)} ({(f === 'todas' ? reservas : reservas.filter(r => r.estado === f)).length})
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="modulo-tabla-wrap"><div className="modulo-tabla-vacio">No hay reservas</div></div>
      ) : (
        <div className="cards-grid">
          {filtradas.sort((a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva)).map(r => (
            <div key={r.idReserva} className="item-card" style={{ borderLeft: `4px solid ${COLOR_ESTADO[r.estado] || '#aaa'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1C1008' }}>{r.codigoConfirmacion}</div>
                  <div style={{ color: '#888', fontSize: '0.82rem' }}>Mesa {r.idMesa}</div>
                </div>
                <span className="estado-badge" style={{ background: COLOR_ESTADO[r.estado] + '22', color: COLOR_ESTADO[r.estado] }}>
                  {r.estado}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#555', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CalendarDays size={13} color="#C8862A" /> {r.fechaReserva} · {r.horaReserva}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={13} color="#C8862A" /> {r.numeroPersonas} personas
                </span>
                {r.duracionEstimada > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} color="#C8862A" /> {r.duracionEstimada} min estimados
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {r.estado === 'pendiente' && (
                  <button onClick={() => confirmar(r)} className="btn-accion" style={{ flex: 1, background: '#27ae60' }}>Confirmar</button>
                )}
                {['pendiente', 'confirmada'].includes(r.estado) && (
                  <button onClick={() => cancelar(r)} className="btn-eliminar" style={{ flex: 1 }}>Cancelar</button>
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
