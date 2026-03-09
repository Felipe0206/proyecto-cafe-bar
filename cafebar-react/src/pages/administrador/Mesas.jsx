import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { mesaService } from '../../services/api';

const FORM_INICIAL = { numeroMesa: '', capacidad: '4', ubicacion: 'interior', estado: 'disponible' };
const UBICACIONES = ['interior', 'terraza', 'privado', 'barra'];
const ESTADOS = ['disponible', 'ocupada', 'reservada', 'mantenimiento'];
const COLOR_ESTADO = { disponible: '#10b981', ocupada: '#ef4444', reservada: '#f59e0b', mantenimiento: '#9ca3af' };

const getQrUrl = (idMesa) => `http://localhost:5173/cliente/menu?mesa=${idMesa}`;

const Mesas = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalQR, setModalQR] = useState(null); // mesa seleccionada para ver QR
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarMesas(); }, []);

  const cargarMesas = async () => {
    try {
      const res = await mesaService.getAll();
      setMesas(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
        const res = await mesaService.create({ ...form, codigoQr: `http://localhost:5173/cliente/menu?mesa=PENDIENTE` });
        // Actualizar QR con el ID real asignado
        if (res.data?.id) {
          await mesaService.update({ idMesa: String(res.data.id), ...form, codigoQr: getQrUrl(res.data.id) });
        }
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando mesas...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🪑 Gestión de Mesas y QR</h1>
        </div>
        <button onClick={abrirCrear} style={{ padding: '0.5rem 1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          + Nueva Mesa
        </button>
      </div>

      {/* Resumen por estado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {ESTADOS.map(est => (
          <div key={est} style={{ background: 'white', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `3px solid ${COLOR_ESTADO[est]}` }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLOR_ESTADO[est] }}>{mesas.filter(m => m.estado === est).length}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>{est}</div>
          </div>
        ))}
      </div>

      {/* Info sobre QR */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#1d4ed8' }}>
        📱 <strong>Cómo usar los QR:</strong> El cliente escanea el código QR de su mesa y se abre el menú automáticamente con la mesa preseleccionada. Haz clic en "Ver QR" para imprimir o compartir.
      </div>

      {/* Grid de mesas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {mesas.sort((a, b) => a.numeroMesa - b.numeroMesa).map(m => (
          <div key={m.idMesa} style={{ background: 'white', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `4px solid ${COLOR_ESTADO[m.estado] || '#9ca3af'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Mesa {m.numeroMesa}</div>
              <span style={{ background: COLOR_ESTADO[m.estado] + '22', color: COLOR_ESTADO[m.estado], padding: '2px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '600' }}>
                {m.estado}
              </span>
            </div>

            {/* QR Code miniatura */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0', cursor: 'pointer' }} onClick={() => setModalQR(m)} title="Clic para ver QR completo">
              <QRCodeSVG value={getQrUrl(m.idMesa)} size={90} level="M" />
            </div>

            <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.75rem', textAlign: 'center' }}>
              <div>👥 {m.capacidad} pers. · 📍 {m.ubicacion}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => setModalQR(m)} style={{ flex: 1, padding: '0.35rem', background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>📱 Ver QR</button>
              <button onClick={() => abrirEditar(m)} style={{ flex: 1, padding: '0.35rem', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
              <button onClick={() => eliminar(m)} style={{ padding: '0.35rem 0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal QR completo */}
      {modalQR && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
          onClick={() => setModalQR(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', maxWidth: '340px', width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 0.25rem' }}>Mesa {modalQR.numeroMesa}</h2>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
              {modalQR.capacidad} personas · {modalQR.ubicacion}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <QRCodeSVG value={getQrUrl(modalQR.idMesa)} size={220} level="H" includeMargin={true} />
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', wordBreak: 'break-all', margin: '0 0 1rem' }}>
              {getQrUrl(modalQR.idMesa)}
            </p>
            <p style={{ fontSize: '0.82rem', color: '#374151', marginBottom: '1.5rem' }}>
              Escanea para acceder al menú con esta mesa seleccionada
            </p>
            <button onClick={() => setModalQR(null)} style={{ padding: '0.6rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '440px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editando ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Número de mesa *</label>
                  <input type="number" min="1" value={form.numeroMesa} onChange={e => setForm({ ...form, numeroMesa: e.target.value })} required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Capacidad *</label>
                  <input type="number" min="1" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })} required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Ubicación</label>
                <select value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {UBICACIONES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Estado</label>
                <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                </select>
              </div>

              {editando && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#166534' }}>QR de esta mesa:</p>
                  <QRCodeSVG value={getQrUrl(editando.idMesa)} size={100} level="M" />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ flex: 2, padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
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
