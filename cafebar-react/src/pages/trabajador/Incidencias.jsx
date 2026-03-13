import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, CheckCircle } from 'lucide-react';
import '../modulos.css';

const TIPOS = ['Equipo dañado', 'Limpieza', 'Mesa dañada', 'Falta de producto', 'Cliente conflictivo', 'Problema eléctrico', 'Otro'];
const PRIORIDADES = [
  { value: 'baja',  label: 'Baja',  color: '#27ae60' },
  { value: 'media', label: 'Media', color: '#E8A830' },
  { value: 'alta',  label: 'Alta',  color: '#e74c3c' }
];

const Incidencias = () => {
  const { user } = useAuth();
  const [incidencias, setIncidencias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ tipo: TIPOS[0], descripcion: '', mesaAfectada: '', prioridad: 'media' });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const reportar = async (e) => {
    e.preventDefault();
    if (!form.descripcion.trim()) { alert('Por favor describe la incidencia'); return; }
    setEnviando(true);
    await new Promise(r => setTimeout(r, 600));
    setIncidencias(prev => [{ id: Date.now(), ...form, reportadoPor: user?.nombre || 'Trabajador', fecha: new Date().toLocaleString('es-CO'), estado: 'abierta' }, ...prev]);
    setForm({ tipo: TIPOS[0], descripcion: '', mesaAfectada: '', prioridad: 'media' });
    setMostrarForm(false);
    setEnviando(false);
  };

  const cerrarIncidencia = (id) => setIncidencias(prev => prev.map(i => i.id === id ? { ...i, estado: 'cerrada' } : i));

  return (
    <div>
      <div className="modulo-header">
        <h1>Reporte de Incidencias</h1>
        <button onClick={() => setMostrarForm(true)} className="btn" style={{ background: '#e74c3c', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nueva Incidencia
        </button>
      </div>

      {mostrarForm && (
        <div className="modulo-modal-overlay">
          <div className="modulo-modal">
            <div className="modulo-modal-header">
              <h2>Reportar Incidencia</h2>
              <button onClick={() => setMostrarForm(false)} className="modulo-modal-close">✕</button>
            </div>
            <form onSubmit={reportar}>
              <div className="modulo-field">
                <label>Tipo de incidencia</label>
                <select name="tipo" value={form.tipo} onChange={handleChange}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="modulo-field">
                <label>Mesa afectada (opcional)</label>
                <input type="text" name="mesaAfectada" value={form.mesaAfectada} onChange={handleChange} placeholder="Ej: Mesa 3" />
              </div>
              <div className="modulo-field">
                <label>Prioridad</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {PRIORIDADES.map(p => (
                    <button type="button" key={p.value} onClick={() => setForm({ ...form, prioridad: p.value })}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: `2px solid ${p.color}`, cursor: 'pointer',
                        background: form.prioridad === p.value ? p.color : 'white',
                        color: form.prioridad === p.value ? 'white' : p.color, fontWeight: '600' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modulo-field">
                <label>Descripción *</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4} placeholder="Describe detalladamente la incidencia..." />
              </div>
              <div className="modulo-modal-actions">
                <button type="button" onClick={() => setMostrarForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={enviando} className="btn" style={{ flex: 2, background: '#e74c3c', color: 'white' }}>
                  {enviando ? 'Enviando...' : 'Reportar Incidencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {incidencias.length === 0 ? (
        <div className="modulo-tabla-wrap">
          <div className="modulo-tabla-vacio" style={{ padding: '4rem' }}>
            <CheckCircle size={48} color="#27ae60" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', margin: 0, color: '#555' }}>No hay incidencias reportadas en esta sesión</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#aaa' }}>Usa el botón "Nueva Incidencia" si necesitas reportar algo</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {incidencias.map(inc => {
            const prioColor = PRIORIDADES.find(p => p.value === inc.prioridad)?.color || '#888';
            return (
              <div key={inc.id} className="item-card" style={{ borderLeft: `4px solid ${prioColor}`, opacity: inc.estado === 'cerrada' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: '700', color: '#1C1008', marginRight: '0.75rem' }}>{inc.tipo}</span>
                    {inc.mesaAfectada && <span style={{ color: '#888', fontSize: '0.88rem' }}>· {inc.mesaAfectada}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="estado-badge" style={{ background: prioColor + '22', color: prioColor }}>{inc.prioridad.toUpperCase()}</span>
                    <span className="estado-badge" style={{ background: inc.estado === 'cerrada' ? '#d1fae5' : '#fee2e2', color: inc.estado === 'cerrada' ? '#065f46' : '#7f1d1d' }}>
                      {inc.estado === 'cerrada' ? 'Cerrada' : 'Abierta'}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0 0 0.5rem', color: '#555', fontSize: '0.92rem' }}>{inc.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#aaa' }}>
                  <span>Reportado por {inc.reportadoPor} · {inc.fecha}</span>
                  {inc.estado === 'abierta' && (
                    <button onClick={() => cerrarIncidencia(inc.id)} className="btn-editar">Marcar resuelta</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Incidencias;
