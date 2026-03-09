package com.cafebar.dao;

import com.cafebar.models.Mesa;
import com.cafebar.config.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.query.Query;

import java.util.List;

/**
 * DAO específico para la entidad Mesa
 * Extiende funcionalidad del GenericHibernateDAO
 * Framework: Hibernate ORM
 * Evidencia: GA7-220501096-AA3-EV01
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class MesaDAO extends GenericHibernateDAO<Mesa> {

    public MesaDAO() {
        super(Mesa.class);
    }

    /**
     * Busca mesas por estado
     *
     * @param estado Estado de la mesa (disponible, ocupada, reservada, mantenimiento)
     * @return Lista de mesas con ese estado
     */
    public List<Mesa> findByEstado(String estado) {
        return findByProperty("estado", estado);
    }

    /**
     * Busca mesas disponibles
     *
     * @return Lista de mesas disponibles
     */
    public List<Mesa> findDisponibles() {
        return findByEstado("disponible");
    }

    /**
     * Busca una mesa por número
     *
     * @param numeroMesa Número de la mesa
     * @return Mesa encontrada o null
     */
    public Mesa findByNumero(int numeroMesa) {
        List<Mesa> result = findByProperty("numeroMesa", numeroMesa);
        return result.isEmpty() ? null : result.get(0);
    }

    /**
     * Busca mesas por ubicación
     *
     * @param ubicacion Ubicación (interior, terraza, area_vip)
     * @return Lista de mesas en esa ubicación
     */
    public List<Mesa> findByUbicacion(String ubicacion) {
        return findByProperty("ubicacion", ubicacion);
    }
}
