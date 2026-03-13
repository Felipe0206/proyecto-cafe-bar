import { useState, useEffect } from 'react';
import { productoService } from '../../services/api';
import { RefreshCw } from 'lucide-react';
import '../modulos.css';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try { const res = await productoService.getAll(); setProductos(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const getColorStock = (stock) => {
    if (stock === 0) return { bg: '#fee2e2', color: '#dc2626', label: 'Sin stock' };
    if (stock < 10) return { bg: '#FDF3E0', color: '#E8A830', label: 'Stock bajo' };
    return { bg: '#d1fae5', color: '#059669', label: 'Ok' };
  };

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <div className="modulo-loading">Cargando inventario...</div>;

  return (
    <div>
      <div className="modulo-header">
        <h1>Inventario de Productos</h1>
        <button onClick={cargarProductos} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      <div className="resumen-cards">
        {[
          { label: 'Total Productos', value: productos.length,                                        color: '#C8862A' },
          { label: 'Disponibles',     value: productos.filter(p => p.disponible).length,              color: '#27ae60' },
          { label: 'Stock Bajo',      value: productos.filter(p => p.stock > 0 && p.stock < 10).length, color: '#E8A830' },
        ].map(s => (
          <div key={s.label} className="resumen-card" style={{ borderTopColor: s.color }}>
            <div className="resumen-card-valor" style={{ color: s.color }}>{s.value}</div>
            <div className="resumen-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <input className="modulo-search" type="text" placeholder="Buscar producto o categoría..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      <div className="modulo-tabla-wrap">
        <table className="modulo-tabla">
          <thead>
            <tr>
              {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Tiempo Prep.'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => {
              const stockInfo = getColorStock(p.stock);
              return (
                <tr key={p.idProducto}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#1C1008' }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{p.descripcion?.substring(0, 50)}</div>
                  </td>
                  <td>{p.categoria}</td>
                  <td style={{ fontWeight: '600' }}>${parseFloat(p.precio).toLocaleString()}</td>
                  <td>
                    <span className="estado-badge" style={{ background: stockInfo.bg, color: stockInfo.color }}>
                      {p.stock} — {stockInfo.label}
                    </span>
                  </td>
                  <td>
                    <span className="estado-badge" style={{ background: p.disponible ? '#d1fae5' : '#fee2e2', color: p.disponible ? '#065f46' : '#7f1d1d' }}>
                      {p.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td>{p.tiempoPreparacion} min</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && <div className="modulo-tabla-vacio">No se encontraron productos</div>}
      </div>
    </div>
  );
};

export default Inventario;
