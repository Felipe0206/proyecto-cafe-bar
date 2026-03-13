import { useState, useEffect } from 'react';
import { productoService, categoriaService } from '../../services/api';
import { Plus } from 'lucide-react';
import '../modulos.css';

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
      if (editando) { await productoService.update({ id: String(editando.idProducto), ...form }); }
      else { await productoService.create(form); }
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

  if (loading) return <div className="modulo-loading">Cargando productos...</div>;

  return (
    <div>
      <div className="modulo-header">
        <h1>Gestión de Productos</h1>
        <button onClick={abrirCrear} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <input className="modulo-search" type="text" placeholder="Buscar producto o categoría..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      <div className="modulo-tabla-wrap">
        <table className="modulo-tabla">
          <thead>
            <tr>
              {['Nombre', 'Categoría', 'Precio', 'Stock', 'Tiempo', 'Estado', 'Acciones'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.idProducto}>
                <td>
                  <div style={{ fontWeight: '600', color: '#1C1008' }}>{p.nombre}</div>
                  <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{p.descripcion?.substring(0, 45)}</div>
                </td>
                <td>{p.categoria}</td>
                <td style={{ fontWeight: '600' }}>${parseFloat(p.precio).toLocaleString()}</td>
                <td>
                  <span className="estado-badge" style={{ background: p.stock < 5 ? '#fee2e2' : '#d1fae5', color: p.stock < 5 ? '#dc2626' : '#059669' }}>
                    {p.stock}
                  </span>
                </td>
                <td>{p.tiempoPreparacion} min</td>
                <td>
                  <span className="estado-badge" style={{ background: p.disponible ? '#d1fae5' : '#fee2e2', color: p.disponible ? '#065f46' : '#7f1d1d' }}>
                    {p.disponible ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => abrirEditar(p)} className="btn-editar">Editar</button>
                    <button onClick={() => eliminar(p)} className="btn-eliminar">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <div className="modulo-tabla-vacio">No se encontraron productos</div>}
      </div>

      {modal && (
        <div className="modulo-modal-overlay">
          <div className="modulo-modal">
            <div className="modulo-modal-header">
              <h2>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setModal(false)} className="modulo-modal-close">✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="modulo-field-row">
                <div className="modulo-field">
                  <label>Nombre *</label>
                  <input type="text" name="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div className="modulo-field">
                  <label>Precio (COP) *</label>
                  <input type="number" name="precio" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                </div>
              </div>
              <div className="modulo-field-row">
                <div className="modulo-field">
                  <label>Stock</label>
                  <input type="number" name="stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="modulo-field">
                  <label>Tiempo preparación (min)</label>
                  <input type="number" name="tiempoPreparacion" value={form.tiempoPreparacion} onChange={e => setForm({ ...form, tiempoPreparacion: e.target.value })} />
                </div>
              </div>
              <div className="modulo-field">
                <label>Categoría *</label>
                <select name="categoriaId" value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="modulo-field">
                <label>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} />
              </div>
              <div className="modulo-field">
                <label>URL imagen</label>
                <input type="text" name="imagenUrl" value={form.imagenUrl} onChange={e => setForm({ ...form, imagenUrl: e.target.value })} />
              </div>
              <div className="modulo-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.disponible} onChange={e => setForm({ ...form, disponible: e.target.checked })} />
                  Disponible en el menú
                </label>
              </div>
              <div className="modulo-modal-actions">
                <button type="button" onClick={() => setModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={guardando} className="btn btn-primary" style={{ flex: 2 }}>
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
