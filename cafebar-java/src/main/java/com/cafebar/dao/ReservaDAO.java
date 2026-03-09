package com.cafebar.dao;

import com.cafebar.models.Reserva;

import java.util.List;

/**
 * DAO específico para la entidad Reserva
 * Framework: Hibernate ORM
 * Evidencia: GA7-220501096-AA3-EV01
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class ReservaDAO extends GenericHibernateDAO<Reserva> {

    public ReservaDAO() {
        super(Reserva.class);
    }

    /**
     * Busca reservas por estado
     *
     * @param estado Estado de la reserva (pendiente, confirmada, cancelada, completada)
     * @return Lista de reservas con ese estado
     */
    public List<Reserva> findByEstado(String estado) {
        return findByProperty("estado", estado);
    }

    /**
     * Busca reservas de un usuario específico
     *
     * @param idUsuario ID del usuario
     * @return Lista de reservas del usuario
     */
    public List<Reserva> findByUsuario(int idUsuario) {
        return findByProperty("idUsuario", idUsuario);
    }

    /**
     * Busca reservas para una mesa específica
     *
     * @param idMesa ID de la mesa
     * @return Lista de reservas para esa mesa
     */
    public List<Reserva> findByMesa(int idMesa) {
        return findByProperty("idMesa", idMesa);
    }
}
