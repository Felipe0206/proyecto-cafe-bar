import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { mesaService } from '../../services/api';
import { Plus, Users, MapPin } from 'lucide-react';
import '../modulos.css';

const FORM_INICIAL = { numeroMesa: '', capacidad: '4', ubicacion: 'interior', estado: 'disponible' };
const UBICACIONES = ['interior', 'terraza', 'privado', 'barra'];
const ESTADOS = ['disponible', 'ocupada', 'reservada', 'mantenimiento'];
const COLOR_ESTADO = { disponible: '#27ae60', ocupada: '#e74c3c', reservada: '#E8A830', mantenimiento: '#888' };

const getQrUrl = (idMesa) => `http://localhost:5173/cliente/menu?mesa=${idMesa}`;

const Mesas = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalQR, setModalQR] = useState(null);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarMesas(); }, []);

  const cargarMesas = async () => {
    try { const res = await mesaService.getAll(); setMesas(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const abrirCrear = () => { setEditando(null); setForm(FORM_INICIAL); setModal(true); };
  const abrirEditar = (m) => {
    setEditando(m);
    setForm({ numeroMesa: String(m.numeroMesa), capacidad: String(m.capacidad), ubicacion: m.ubicacion, estado: m.estado });
    setModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.numeroMesa || !form.capacidad) { alert('Complete los campos obligatorios'); return; }
    setGuardando(true);
    try {
      if (editando) {
        await mesaService.update({ idMesa: String(editando.idMesa), ...form, codigoQr: getQrUrl(editando.idMesa) });
      } else {
        const res = await mesaService.create({ ...form, codigoQr: 'http://localhost:5173/cliente/menu?mesa=PENDIENTE' });
        if (res.data?.id) await mesaService.update({ idMesa: String(res.data.id), ...form, codigoQr: getQrUrl(res.data.id) });
      }
      await cargarMesas();
      setModal(false);
    } catch (e) { alert('Error al guardar mesa'); }
    finally { setGuardando(false); }
  };

  const eliminar = async (m) => {
    if (!window.confirm(`¿Eliminar Mesa ${m.numeroMesa}?`)) return;
    try { await mesaService.delete(m.idMesa); await cargarMesas(); }
    catch (e) { alert('Error al eliminar mesa'); }
  };

  if (loading) return <div className="modulo-loading">Cargando mesas...</div>;

  return (
    <div>
      <div className="modulo-header">
        <h1>Gestión de Mesas y QR</h1>
        <button onClick={abrirCrear} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nueva Mesa
        </button>
      </div>

      {/* Resumen por estado */}
      <div className="resumen-cards">
        {ESTADOS.map(est => (
          <div key={est} className="resumen-card" style={{ borderTopColor: COLOR_ESTADO[est] }}>
            <div className="resumen-card-valor" style={{ color: COLOR_ESTADO[est] }}>
              {mesas.filter(m => m.estado === est).length}
            </div>
            <div className="resumen-card-label">{est}</div>
          </div>
        ))}
      </div>

      <div className="info-banner">
        <strong>Cómo usar los QR:</strong> El cliente escanea el código QR de su mesa y se abre el menú automáticamente. Haz clic en el QR para ver en grande.
      </div>

      {/* Grid de mesas */}
      <div className="cards-grid">
        {mesas.sort((a, b) => a.numeroMesa - b.numeroMesa).map(m => (
          <div key={m.idMesa} className="item-card" style={{ borderTop: `4px solid ${COLOR_ESTADO[m.estado] || '#aaa'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1C1008' }}>Mesa {m.numeroMesa}</div>
              <span className="estado-badge" style={{ background: COLOR_ESTADO[m.estado] + '22', color: COLOR_ESTADO[m.estado] }}>
                {m.estado}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0', cursor: 'pointer' }} onClick={() => setModalQR(m)}>
              <QRCodeSVG value={getQrUrl(m.idMesa)} size={90} level="M" />
            </div>

            <div style={{ fontSize: '0.82rem', color: '#888', textAlign: 'center', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Users size={12} /> {m.capacidad} pers.</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {m.ubicacion}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => setModalQR(m)} className="btn-accion" style={{ flex: 1, background: '#27ae60' }}>Ver QR</button>
              <button onClick={() => abrirEditar(m)} className="btn-editar" style={{ flex: 1 }}>Editar</button>
              <button onClick={() => eliminar(m)} className="btn-eliminar">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal QR */}
      {modalQR && (
        <div className="modulo-modal-overlay" onClick={() => setModalQR(null)}>
          <div className="modulo-modal" style={{ maxWidth: '340px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 0.25rem', color: '#1C1008' }}>Mesa {modalQR.numeroMesa}</h2>
            <p style={{ color: '#888', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
              {modalQR.capacidad} personas · {modalQR.ubicacion}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <QRCodeSVG value={getQrUrl(modalQR.idMesa)} size={220} level="H" includeMargin={true} />
            </div>
            <p style={{ fontSize: '0.78rem', color: '#aaa', wordBreak: 'break-all', margin: '0 0 1.5rem' }}>
              {getQrUrl(modalQR.idMesa)}
            </p>
            <button onClick={() => setModalQR(null)} className="btn btn-primary" style={{ width: '100%' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div className="modulo-modal-overlay">
          <div className="modulo-modal">
            <div className="modulo-modal-header">
              <h2>{editando ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
              <button onClick={() => setModal(false)} className="modulo-modal-close">✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modulo-field-row">
                <div className="modulo-field">
                  <label>Número de mesa *</label>
                  <input type="number" min="1" value={form.numeroMesa} onChange={e => setForm({ ...form, numeroMesa: e.target.value })} required />
                </div>
                <div className="modulo-field">
                  <label>Capacidad *</label>
                  <input type="number" min="1" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })} required />
                </div>
              </div>
              <div className="modulo-field-row">
                <div className="modulo-field">
                  <label>Ubicación</label>
                  <select value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })}>
                    {UBICACIONES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="modulo-field">
                  <label>Estado</label>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                  </select>
                </div>
              </div>
              {editando && (
                <div style={{ textAlign: 'center', padding: '1rem', background: '#F7F3EE', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#888' }}>QR de esta mesa:</p>
                  <QRCodeSVG value={getQrUrl(editando.idMesa)} size={100} level="M" />
                </div>
              )}
              <div className="modulo-modal-actions">
                <button type="button" onClick={() => setModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={guardando} className="btn btn-primary" style={{ flex: 2 }}>
                  {guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear Mesa')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mesas;
