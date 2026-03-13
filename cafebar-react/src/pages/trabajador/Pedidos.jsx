import { useState, useEffect } from 'react';
import { pedidoService } from '../../services/api';
import { RefreshCw } from 'lucide-react';
import '../modulos.css';

const ESTADOS_LABEL = { pendiente: 'Pendiente', en_preparacion: 'En Preparación', listo: 'Listo para entregar', entregado: 'Entregado', cancelado: 'Cancelado' };
const SIGUIENTE_ESTADO = { pendiente: 'en_preparacion', en_preparacion: 'listo', listo: 'entregado' };
const COLOR_ESTADO = { pendiente: '#E8A830', en_preparacion: '#3b82f6', listo: '#27ae60', entregado: '#888', cancelado: '#e74c3c' };

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('activos');
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarPedidos = async () => {
    try { const res = await pedidoService.getAll(); setPedidos(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const cambiarEstado = async (pedido, nuevoEstado) => {
    setActualizando(pedido.idPedido);
    try { await pedidoService.cambiarEstado(pedido.idPedido, nuevoEstado); await cargarPedidos(); }
    catch (e) { alert('Error al cambiar estado del pedido'); }
    finally { setActualizando(null); }
  };

  const cancelar = async (pedido) => {
    if (!window.confirm('¿Cancelar este pedido?')) return;
    await cambiarEstado(pedido, 'cancelado');
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'activos') return ['pendiente', 'en_preparacion', 'listo'].includes(p.estado);
    return p.estado === filtro;
  }).sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));

  if (loading) return <div className="modulo-loading">Cargando pedidos...</div>;

  return (
    <div>
      <div className="modulo-header">
        <h1>Gestión de Pedidos</h1>
        <button onClick={cargarPedidos} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      <div className="modulo-filtros">
        {['activos', 'pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`modulo-filtro-btn${filtro === f ? ' activo' : ''}`}>
            {f === 'activos' ? 'Activos' : ESTADOS_LABEL[f]}
            {f !== 'activos' && <span style={{ marginLeft: '0.3rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '0 5px', fontSize: '0.8rem' }}>{pedidos.filter(p => p.estado === f).length}</span>}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="modulo-tabla-wrap"><div className="modulo-tabla-vacio">No hay pedidos {filtro === 'activos' ? 'activos en este momento' : `con estado "${ESTADOS_LABEL[filtro]}"`}</div></div>
      ) : (
        <div className="cards-grid">
          {pedidosFiltrados.map(pedido => (
            <div key={pedido.idPedido} className="item-card" style={{ borderLeft: `4px solid ${COLOR_ESTADO[pedido.estado]}`, opacity: actualizando === pedido.idPedido ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#1C1008' }}>#{pedido.codigoPedido}</div>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>Mesa {pedido.idMesa} · {pedido.tipoPedido}</div>
                </div>
                <span className="estado-badge" style={{ background: COLOR_ESTADO[pedido.estado], color: 'white' }}>
                  {ESTADOS_LABEL[pedido.estado] || pedido.estado}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#555', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Total</span>
                  <strong style={{ color: '#C8862A' }}>${parseFloat(pedido.total || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hora</span>
                  <span>{new Date(pedido.fechaPedido).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {pedido.observaciones && (
                  <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: '#FDF3E0', borderRadius: '6px', fontSize: '0.82rem', color: '#7A5010' }}>
                    {pedido.observaciones}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {SIGUIENTE_ESTADO[pedido.estado] && (
                  <button onClick={() => cambiarEstado(pedido, SIGUIENTE_ESTADO[pedido.estado])} disabled={actualizando === pedido.idPedido}
                    className="btn-accion" style={{ flex: 1, background: COLOR_ESTADO[SIGUIENTE_ESTADO[pedido.estado]] }}>
                    → {ESTADOS_LABEL[SIGUIENTE_ESTADO[pedido.estado]]}
                  </button>
                )}
                {['pendiente', 'en_preparacion'].includes(pedido.estado) && (
                  <button onClick={() => cancelar(pedido)} disabled={actualizando === pedido.idPedido} className="btn-eliminar">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionPedidos;
