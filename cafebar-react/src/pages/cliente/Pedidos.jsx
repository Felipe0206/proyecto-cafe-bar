import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Pedidos.css';

/**
 * Página de Pedidos para Clientes
 * Replica funcionalidad de views/cliente/pedidos.html
 * Muestra pedidos activos y su estado
 */
const PedidosCliente = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarPedidos = async () => {
    try {
      const response = await pedidoService.getByUsuario(user.id);
      const pedidosActivos = response.data.data.filter(
        p => p.estado !== 'entregado' && p.estado !== 'cancelado'
      );
      setPedidos(pedidosActivos);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': '#ffa500',
      'en_preparacion': '#3498db',
      'listo': '#27ae60',
      'entregado': '#95a5a6',
      'cancelado': '#e74c3c'
    };
    return colores[estado] || '#95a5a6';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'en_preparacion': 'En Preparación',
      'listo': 'Listo para Servir',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  return (
    <div className="pedidos-cliente-container">
      <header>
        <h1>📋 Mis Pedidos</h1>
        <button className="btn-refresh" onClick={cargarPedidos}>
          🔄 Actualizar
        </button>
      </header>

      {pedidos.length === 0 ? (
        <div className="no-pedidos">
          <p>No tienes pedidos activos</p>
          <Link to="/cliente/menu" className="btn btn-primary">
            Ver Menú
          </Link>
        </div>
      ) : (
        <div className="pedidos-list">
          {pedidos.map(pedido => (
            <div key={pedido.idPedido} className="pedido-card">
              <div className="pedido-header">
                <div>
                  <h3>Pedido #{pedido.numeroPedido}</h3>
                  <p className="mesa">Mesa #{pedido.idMesa}</p>
                </div>
                <div
                  className="estado-badge"
                  style={{ backgroundColor: getEstadoColor(pedido.estado) }}
                >
                  {getEstadoTexto(pedido.estado)}
                </div>
              </div>

              <div className="pedido-body">
                <div className="info-row">
                  <span>Hora:</span>
                  <span>{new Date(pedido.fechaPedido).toLocaleTimeString()}</span>
                </div>
                <div className="info-row">
                  <span>Total:</span>
                  <span className="total">${pedido.total.toLocaleString()}</span>
                </div>
                {pedido.notas && (
                  <div className="notas">
                    <strong>Notas:</strong> {pedido.notas}
                  </div>
                )}
              </div>

              {pedido.estado === 'listo' && (
                <div className="alerta-listo">
                  ✅ ¡Tu pedido está listo! Pasa a recogerlo.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosCliente;
