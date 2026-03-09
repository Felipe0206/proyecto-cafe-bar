import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TIPOS = ['Equipo dañado', 'Limpieza', 'Mesa dañada', 'Falta de producto', 'Cliente conflictivo', 'Problema eléctrico', 'Otro'];
const PRIORIDADES = [
  { value: 'baja', label: 'Baja', color: '#10b981' },
  { value: 'media', label: 'Media', color: '#f59e0b' },
  { value: 'alta', label: 'Alta', color: '#ef4444' }
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
    const nueva = {
      id: Date.now(),
      ...form,
      reportadoPor: user?.nombre || 'Trabajador',
      fecha: new Date().toLocaleString('es-CO'),
      estado: 'abierta'
    };
    setIncidencias(prev => [nueva, ...prev]);
    setForm({ tipo: TIPOS[0], descripcion: '', mesaAfectada: '', prioridad: 'media' });
    setMostrarForm(false);
    setEnviando(false);
    alert('Incidencia reportada exitosamente');
  };

  const cerrarIncidencia = (id) => {
    setIncidencias(prev => prev.map(i => i.id === id ? { ...i, estado: 'cerrada' } : i));
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/trabajador/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>⚠️ Reporte de Incidencias</h1>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          style={{ padding: '0.5rem 1.2rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          + Nueva Incidencia
        </button>
      </div>

      {/* Modal formulario */}
      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>⚠️ Reportar Incidencia</h2>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <form onSubmit={reportar}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Tipo de incidencia</label>
                <select name="tipo" value={form.tipo} onChange={handleChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Mesa afectada (opcional)</label>
                <input type="text" name="mesaAfectada" value={form.mesaAfectada} onChange={handleChange}
                  placeholder="Ej: Mesa 3"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Prioridad</label>
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Descripción *</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4}
                  placeholder="Describe detalladamente la incidencia..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setMostrarForm(false)}
                  style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={enviando}
                  style={{ flex: 2, padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {enviando ? 'Enviando...' : 'Reportar Incidencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de incidencias */}
      {incidencias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>No hay incidencias reportadas en esta sesión</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Usa el botón "Nueva Incidencia" si necesitas reportar algo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {incidencias.map(inc => {
            const prioColor = PRIORIDADES.find(p => p.value === inc.prioridad)?.color || '#6b7280';
            return (
              <div key={inc.id} style={{ background: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${prioColor}`, opacity: inc.estado === 'cerrada' ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', marginRight: '0.75rem' }}>{inc.tipo}</span>
                    {inc.mesaAfectada && <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>· {inc.mesaAfectada}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ background: prioColor + '22', color: prioColor, padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600' }}>
                      {inc.prioridad.toUpperCase()}
                    </span>
                    <span style={{ background: inc.estado === 'cerrada' ? '#d1fae5' : '#fee2e2', color: inc.estado === 'cerrada' ? '#065f46' : '#7f1d1d', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>
                      {inc.estado === 'cerrada' ? 'Cerrada' : 'Abierta'}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0 0 0.5rem', color: '#4b5563', fontSize: '0.92rem' }}>{inc.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#9ca3af' }}>
                  <span>Reportado por {inc.reportadoPor} · {inc.fecha}</span>
                  {inc.estado === 'abierta' && (
                    <button onClick={() => cerrarIncidencia(inc.id)}
                      style={{ padding: '0.3rem 0.75rem', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
                      Marcar resuelta
                    </button>
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
