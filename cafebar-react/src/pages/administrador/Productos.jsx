import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productoService, categoriaService } from '../../services/api';

const FORM_INICIAL = { nombre: '', descripcion: '', precio: '', categoriaId: '', disponible: true, tiempoPreparacion: '5', stock: '0', imagenUrl: '' };

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([productoService.getAll(), categoriaService.getAll()]);
      setProductos(prodRes.data.data || []);
      setCategorias(catRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const abrirCrear = () => { setEditando(null); setForm(FORM_INICIAL); setModal(true); };
  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: String(p.precio), categoriaId: String(p.categoriaId), disponible: p.disponible, tiempoPreparacion: String(p.tiempoPreparacion || 5), stock: String(p.stock || 0), imagenUrl: p.imagenUrl || '' });
    setModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.categoriaId) { alert('Complete los campos obligatorios'); return; }
    setGuardando(true);
    try {
      if (editando) {
        await productoService.update({ id: String(editando.idProducto), ...form });
      } else {
        await productoService.create(form);
      }
      await cargarDatos();
      setModal(false);
    } catch (e) { alert('Error al guardar producto'); }
    finally { setGuardando(false); }
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try { await productoService.delete(p.idProducto); await cargarDatos(); }
    catch (e) { alert('Error al eliminar'); }
  };

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando productos...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🍽️ Gestión de Productos</h1>
        </div>
        <button onClick={abrirCrear} style={{ padding: '0.5rem 1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          + Nuevo Producto
        </button>
      </div>

      <input type="text" placeholder="🔍 Buscar producto o categoría..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box' }} />

      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Nombre', 'Categoría', 'Precio', 'Stock', 'Tiempo', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p, i) => (
              <tr key={p.idProducto} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: '500' }}>{p.nombre}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{p.descripcion?.substring(0, 45)}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.9rem' }}>{p.categoria}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>${parseFloat(p.precio).toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ background: p.stock < 5 ? '#fee2e2' : '#d1fae5', color: p.stock < 5 ? '#dc2626' : '#059669', padding: '2px 8px', borderRadius: '10px', fontSize: '0.82rem' }}>
                    {p.stock}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.9rem' }}>{p.tiempoPreparacion} min</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ background: p.disponible ? '#d1fae5' : '#fee2e2', color: p.disponible ? '#065f46' : '#7f1d1d', padding: '2px 8px', borderRadius: '10px', fontSize: '0.82rem' }}>
                    {p.disponible ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => abrirEditar(p)} style={{ padding: '0.3rem 0.75rem', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>Editar</button>
                    <button onClick={() => eliminar(p)} style={{ padding: '0.3rem 0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No se encontraron productos</div>}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '520px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <form onSubmit={guardar}>
              {[
                { label: 'Nombre *', name: 'nombre', type: 'text', required: true },
                { label: 'Precio (COP) *', name: 'precio', type: 'number', required: true },
                { label: 'Stock', name: 'stock', type: 'number' },
                { label: 'Tiempo de preparación (min)', name: 'tiempoPreparacion', type: 'number' },
                { label: 'URL imagen', name: 'imagenUrl', type: 'text' },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>{f.label}</label>
                  <input type={f.type} name={f.name} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required={f.required}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
              ))}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Categoría *</label>
                <select name="categoriaId" value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })} required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.disponible} onChange={e => setForm({ ...form, disponible: e.target.checked })} />
                  <span style={{ fontWeight: '500' }}>Disponible en el menú</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ flex: 2, padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear Producto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
