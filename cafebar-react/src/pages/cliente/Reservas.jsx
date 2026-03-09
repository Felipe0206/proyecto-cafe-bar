import { useState, useEffect } from 'react';
import { reservaService, mesaService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Reservas.css';

/**
 * Página de Reservas para Clientes
 * Replica funcionalidad de views/cliente/reservas.html
 */
const ReservasCliente = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    personas: 2,
    mesaId: '',
    notas: ''
  });

  useEffect(() => {
    cargarReservas();
    cargarMesas();
  }, []);

  const cargarReservas = async () => {
    try {
      const response = await reservaService.getByUsuario(user.id);
      setReservas(response.data.data || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    }
  };

  const cargarMesas = async () => {
    try {
      const response = await mesaService.getAll();
      setMesas(response.data.data || []);
    } catch (error) {
      console.error('Error cargando mesas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const reserva = {
        clienteId: user?.clienteId ? String(user.clienteId) : undefined,
        idMesa: formData.mesaId,
        fechaReserva: formData.fecha,
        horaReserva: formData.hora,
        numeroPersonas: String(formData.personas),
        motivo: formData.notas
      };

      await reservaService.create(reserva);
      alert('¡Reserva creada exitosamente!');
      setShowModal(false);
      cargarReservas();
      setFormData({ fecha: '', hora: '', personas: 2, mesaId: '', notas: '' });
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert('Error al crear la reserva');
    }
  };

  const cancelarReserva = async (id) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    try {
      await reservaService.cancelar(id);
      alert('Reserva cancelada');
      cargarReservas();
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      alert('Error al cancelar la reserva');
    }
  };

  return (
    <div className="reservas-cliente-container">
      <header>
        <h1>📅 Mis Reservas</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nueva Reserva
        </button>
      </header>

      <div className="reservas-grid">
        {reservas.map(reserva => (
          <div key={reserva.idReserva} className={`reserva-card ${reserva.estado}`}>
            <div className="reserva-icon">
              {reserva.estado === 'confirmada' ? '✅' :
               reserva.estado === 'pendiente' ? '⏳' :
               reserva.estado === 'cancelada' ? '❌' : '✔️'}
            </div>
            <div className="reserva-info">
              <h3>{new Date(reserva.fechaReserva).toLocaleDateString()}</h3>
              <p>{reserva.horaReserva} - {reserva.numeroPersonas} personas</p>
              <p>Mesa #{reserva.idMesa}</p>
              <span className={`estado ${reserva.estado}`}>
                {reserva.estado.toUpperCase()}
              </span>
            </div>
            {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
              <button
                className="btn-cancelar"
                onClick={() => cancelarReserva(reserva.idReserva || reserva.id)}
              >
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal Nueva Reserva */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva Reserva</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hora</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({...formData, hora: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Número de Personas</label>
                <input
                  type="number"
                  value={formData.personas}
                  onChange={(e) => setFormData({...formData, personas: e.target.value})}
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mesa</label>
                <select
                  value={formData.mesaId}
                  onChange={(e) => setFormData({...formData, mesaId: e.target.value})}
                  required
                >
                  <option value="">Seleccione una mesa</option>
                  {mesas.filter(m => m.estado === 'disponible').map(mesa => (
                    <option key={mesa.idMesa} value={mesa.idMesa}>
                      Mesa {mesa.numeroMesa} - Capacidad: {mesa.capacidad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notas Especiales (opcional)</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  placeholder="Alergias, preferencias, ocasión especial..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasCliente;
