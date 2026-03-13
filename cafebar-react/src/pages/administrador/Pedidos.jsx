import { useState, useEffect } from 'react';
import { pedidoService } from '../../services/api';
import { RefreshCw } from 'lucide-react';
import '../modulos.css';

const ESTADOS_LABEL = { pendiente: 'Pendiente', en_preparacion: 'En Preparación', listo: 'Listo', entregado: 'Entregado', cancelado: 'Cancelado' };
const COLOR_ESTADO = { pendiente: '#E8A830', en_preparacion: '#3b82f6', listo: '#27ae60', entregado: '#888', cancelado: '#e74c3c' };
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

  if (loading) return <div className="modulo-loading">Cargando pedidos...</div>;

  return (
    <div>
      <div className="modulo-header">
        <h1>Todos los Pedidos</h1>
        <button onClick={cargar} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      <div className="modulo-filtros">
        {['todos', ...Object.keys(ESTADOS_LABEL)].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`modulo-filtro-btn${filtro === f ? ' activo' : ''}`}>
            {f === 'todos' ? 'Todos' : ESTADOS_LABEL[f]} ({(f === 'todos' ? pedidos : pedidos.filter(p => p.estado === f)).length})
          </button>
        ))}
      </div>

      <div className="modulo-tabla-wrap">
        <table className="modulo-tabla">
          <thead>
            <tr>
              {['Código', 'Mesa', 'Total', 'Estado', 'Tipo', 'Fecha / Hora', 'Acciones'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido)).map(p => (
              <tr key={p.idPedido}>
                <td style={{ fontWeight: '600' }}>{p.codigoPedido}</td>
                <td>Mesa {p.idMesa}</td>
                <td style={{ fontWeight: '600' }}>${parseFloat(p.total || 0).toLocaleString()}</td>
                <td>
                  <span className="estado-badge" style={{ background: COLOR_ESTADO[p.estado] + '22', color: COLOR_ESTADO[p.estado] }}>
                    {ESTADOS_LABEL[p.estado] || p.estado}
                  </span>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{p.tipoPedido}</td>
                <td style={{ fontSize: '0.85rem', color: '#888' }}>
                  {new Date(p.fechaPedido).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {SIGUIENTE[p.estado] && (
                      <button onClick={() => cambiarEstado(p, SIGUIENTE[p.estado])} className="btn-accion"
                        style={{ background: COLOR_ESTADO[SIGUIENTE[p.estado]] }}>
                        → {ESTADOS_LABEL[SIGUIENTE[p.estado]].split(' ')[0]}
                      </button>
                    )}
                    {['pendiente', 'en_preparacion'].includes(p.estado) && (
                      <button onClick={() => cambiarEstado(p, 'cancelado')} className="btn-eliminar">✕</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <div className="modulo-tabla-vacio">No hay pedidos</div>}
      </div>
    </div>
  );
};

export default PedidosAdmin;
