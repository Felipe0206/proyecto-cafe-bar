import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productoService } from '../../services/api';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await productoService.getAll();
      setProductos(res.data.data || []);
    } catch (e) {
      console.error('Error cargando inventario:', e);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const getColorStock = (stock) => {
    if (stock === 0) return { bg: '#fee2e2', color: '#dc2626', label: 'Sin stock' };
    if (stock < 10) return { bg: '#fef9c3', color: '#d97706', label: 'Stock bajo' };
    return { bg: '#d1fae5', color: '#059669', label: 'Ok' };
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando inventario...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/trabajador/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📦 Inventario de Productos</h1>
        </div>
        <button onClick={cargarProductos} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
          🔄 Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Productos', value: productos.length, color: '#2563eb' },
          { label: 'Disponibles', value: productos.filter(p => p.disponible).length, color: '#10b981' },
          { label: 'Stock Bajo', value: productos.filter(p => p.stock > 0 && p.stock < 10).length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '10px', padding: '1rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="🔍 Buscar producto o categoría..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box' }}
      />

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Tiempo Prep.'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p, i) => {
              const stockInfo = getColorStock(p.stock);
              return (
                <tr key={p.idProducto} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: '500' }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{p.descripcion?.substring(0, 50)}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.9rem' }}>{p.categoria}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>${parseFloat(p.precio).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: stockInfo.bg, color: stockInfo.color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '500' }}>
                      {p.stock} — {stockInfo.label}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: p.disponible ? '#d1fae5' : '#fee2e2', color: p.disponible ? '#065f46' : '#7f1d1d', padding: '3px 10px', borderRadius: '12px', fontSize: '0.82rem' }}>
                      {p.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.9rem' }}>{p.tiempoPreparacion} min</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {productosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No se encontraron productos</div>
        )}
      </div>
    </div>
  );
};

export default Inventario;
