import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService } from '../../services/api';

const ESTADOS_LABEL = { pendiente: 'Pendiente', en_preparacion: 'En Preparación', listo: 'Listo', entregado: 'Entregado', cancelado: 'Cancelado' };
const COLOR_ESTADO = { pendiente: '#f59e0b', en_preparacion: '#3b82f6', listo: '#10b981', entregado: '#6b7280', cancelado: '#ef4444' };
const SIGUIENTE = { pendiente: 'en_preparacion', en_preparacion: 'listo', listo: 'entregado' };

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => { cargar(); const iv = setInterval(cargar, 30000); return () => clearInterval(iv); }, []);

  const cargar = async () => {
    try { const r = await pedidoService.getAll(); setPedidos(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const cambiarEstado = async (p, estado) => {
    try { await pedidoService.cambiarEstado(p.idPedido, estado); await cargar(); }
    catch (e) { alert('Error al actualizar pedido'); }
  };

  const filtrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando pedidos...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📋 Todos los Pedidos</h1>
        </div>
        <button onClick={cargar} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>🔄</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['todos', ...Object.keys(ESTADOS_LABEL)].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: filtro === f ? '#2563eb' : '#f1f5f9', color: filtro === f ? 'white' : '#374151' }}>
            {f === 'todos' ? 'Todos' : ESTADOS_LABEL[f]} ({(f === 'todos' ? pedidos : pedidos.filter(p => p.estado === f)).length})
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Código', 'Mesa', 'Total', 'Estado', 'Tipo', 'Fecha/Hora', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido)).map((p, i) => (
              <tr key={p.idPedido} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '500', fontSize: '0.88rem' }}>{p.codigoPedido}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>Mesa {p.idMesa}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>${parseFloat(p.total || 0).toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ background: COLOR_ESTADO[p.estado] + '22', color: COLOR_ESTADO[p.estado], padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {ESTADOS_LABEL[p.estado] || p.estado}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.88rem', textTransform: 'capitalize' }}>{p.tipoPedido}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.82rem' }}>
                  {new Date(p.fechaPedido).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {SIGUIENTE[p.estado] && (
                      <button onClick={() => cambiarEstado(p, SIGUIENTE[p.estado])}
                        style={{ padding: '0.3rem 0.6rem', background: COLOR_ESTADO[SIGUIENTE[p.estado]], color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.78rem' }}>
                        → {ESTADOS_LABEL[SIGUIENTE[p.estado]].split(' ')[0]}
                      </button>
                    )}
                    {['pendiente', 'en_preparacion'].includes(p.estado) && (
                      <button onClick={() => cambiarEstado(p, 'cancelado')}
                        style={{ padding: '0.3rem 0.6rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.78rem' }}>
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No hay pedidos</div>}
      </div>
    </div>
  );
};

export default PedidosAdmin;
