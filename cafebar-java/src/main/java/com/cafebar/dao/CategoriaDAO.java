package com.cafebar.dao;

import com.cafebar.models.Categoria;

import java.util.List;

/**
 * DAO específico para la entidad Categoria
 * Framework: Hibernate ORM
 * Evidencia: GA7-220501096-AA3-EV01
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class CategoriaDAO extends GenericHibernateDAO<Categoria> {

    public CategoriaDAO() {
        super(Categoria.class);
    }

    /**
     * Busca categorías activas
     *
     * @return Lista de categorías activas
     */
    public List<Categoria> findActivas() {
        return findByProperty("activo", true);
    }

    /**
     * Busca una categoría por nombre
     *
     * @param nombre Nombre de la categoría
     * @return Categoría encontrada o null
     */
    public Categoria findByNombre(String nombre) {
        List<Categoria> result = findByProperty("nombre", nombre);
        return result.isEmpty() ? null : result.get(0);
    }
}
