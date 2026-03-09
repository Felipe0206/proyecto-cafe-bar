package com.cafebar.dao;

import com.cafebar.models.Pedido;

import java.util.List;

/**
 * DAO específico para la entidad Pedido
 * Framework: Hibernate ORM
 * Evidencia: GA7-220501096-AA3-EV01
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class PedidoDAO extends GenericHibernateDAO<Pedido> {

    public PedidoDAO() {
        super(Pedido.class);
    }

    /**
     * Busca pedidos por estado
     *
     * @param estado Estado del pedido (pendiente, en_preparacion, listo, entregado, cancelado)
     * @return Lista de pedidos con ese estado
     */
    public List<Pedido> findByEstado(String estado) {
        return findByProperty("estado", estado);
    }

    /**
     * Busca pedidos de una mesa específica
     *
     * @param idMesa ID de la mesa
     * @return Lista de pedidos de esa mesa
     */
    public List<Pedido> findByMesa(int idMesa) {
        return findByProperty("idMesa", idMesa);
    }

    /**
     * Busca pedidos de un usuario específico
     *
     * @param idUsuario ID del usuario
     * @return Lista de pedidos del usuario
     */
    public List<Pedido> findByUsuario(int idUsuario) {
        return findByProperty("idUsuario", idUsuario);
    }

    /**
     * Busca pedidos activos (no entregados ni cancelados)
     *
     * @return Lista de pedidos activos
     */
    public List<Pedido> findActivos() {
        return findByEstado("pendiente");
    }
}
