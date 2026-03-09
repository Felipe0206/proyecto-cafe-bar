import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService } from '../../services/api';

const ESTADOS_LABEL = {
  pendiente: 'Pendiente',
  en_preparacion: 'En Preparación',
  listo: 'Listo para entregar',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

const SIGUIENTE_ESTADO = {
  pendiente: 'en_preparacion',
  en_preparacion: 'listo',
  listo: 'entregado'
};

const COLOR_ESTADO = {
  pendiente: '#f59e0b',
  en_preparacion: '#3b82f6',
  listo: '#10b981',
  entregado: '#6b7280',
  cancelado: '#ef4444'
};

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
    try {
      const res = await pedidoService.getAll();
      setPedidos(res.data.data || []);
    } catch (e) {
      console.error('Error cargando pedidos:', e);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (pedido, nuevoEstado) => {
    setActualizando(pedido.idPedido);
    try {
      await pedidoService.cambiarEstado(pedido.idPedido, nuevoEstado);
      await cargarPedidos();
    } catch (e) {
      alert('Error al cambiar estado del pedido');
    } finally {
      setActualizando(null);
    }
  };

  const cancelar = async (pedido) => {
    if (!window.confirm('¿Cancelar este pedido?')) return;
    await cambiarEstado(pedido, 'cancelado');
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtro === 'activos') return ['pendiente', 'en_preparacion', 'listo'].includes(p.estado);
    return p.estado === filtro;
  }).sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando pedidos...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/trabajador/dashboard" style={{ textDecoration: 'none', fontSize: '1.4rem', color: '#2563eb' }}>←</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📋 Gestión de Pedidos</h1>
        </div>
        <button onClick={cargarPedidos} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['activos', 'pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: filtro === f ? '#2563eb' : '#f1f5f9',
              color: filtro === f ? 'white' : '#374151',
              fontWeight: filtro === f ? 'bold' : 'normal'
            }}
          >
            {f === 'activos' ? 'Activos' : ESTADOS_LABEL[f]}
            {f !== 'activos' && (
              <span style={{ marginLeft: '0.3rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '0 5px', fontSize: '0.8rem' }}>
                {pedidos.filter(p => p.estado === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
          <p>No hay pedidos {filtro === 'activos' ? 'activos en este momento' : `con estado "${ESTADOS_LABEL[filtro]}"`}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {pedidosFiltrados.map(pedido => (
            <div key={pedido.idPedido} style={{
              background: 'white', borderRadius: '10px', padding: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderLeft: `4px solid ${COLOR_ESTADO[pedido.estado] || '#6b7280'}`,
              opacity: actualizando === pedido.idPedido ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>#{pedido.codigoPedido}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Mesa {pedido.idMesa} · {pedido.tipoPedido}</div>
                </div>
                <span style={{
                  background: COLOR_ESTADO[pedido.estado], color: 'white',
                  padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', whiteSpace: 'nowrap'
                }}>
                  {ESTADOS_LABEL[pedido.estado] || pedido.estado}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#4b5563', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>💰 Total</span>
                  <strong>${parseFloat(pedido.total || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span>🕐 Hora</span>
                  <span>{new Date(pedido.fechaPedido).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {pedido.observaciones && (
                  <div style={{ marginTop: '0.25rem', padding: '0.4rem', background: '#fef9c3', borderRadius: '4px', fontSize: '0.82rem' }}>
                    📝 {pedido.observaciones}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {SIGUIENTE_ESTADO[pedido.estado] && (
                  <button
                    onClick={() => cambiarEstado(pedido, SIGUIENTE_ESTADO[pedido.estado])}
                    disabled={actualizando === pedido.idPedido}
                    style={{
                      flex: 1, padding: '0.5rem', background: COLOR_ESTADO[SIGUIENTE_ESTADO[pedido.estado]],
                      color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
                    }}
                  >
                    → {ESTADOS_LABEL[SIGUIENTE_ESTADO[pedido.estado]]}
                  </button>
                )}
                {['pendiente', 'en_preparacion'].includes(pedido.estado) && (
                  <button
                    onClick={() => cancelar(pedido)}
                    disabled={actualizando === pedido.idPedido}
                    style={{ padding: '0.5rem 0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
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
