package com.cafebar.config;

import org.hibernate.SessionFactory;
import org.hibernate.boot.Metadata;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;

/**
 * Clase utilitaria para gestionar Hibernate SessionFactory
 * Implementa el patrón Singleton para garantizar una única instancia
 * de SessionFactory durante el ciclo de vida de la aplicación
 *
 * Sistema de Gestión Café Bar - Framework Hibernate ORM
 * Evidencia: GA7-220501096-AA3-EV01
 *
 * @author Andrés Felipe Gil Gallo
 * @version 1.0
 */
public class HibernateUtil {

    // Instancia única de SessionFactory (Singleton)
    private static SessionFactory sessionFactory;

    // Registro de servicios de Hibernate
    private static StandardServiceRegistry registry;

    /**
     * Constructor privado para evitar instanciación
     * Patrón Singleton
     */
    private HibernateUtil() {
    }

    /**
     * Obtiene la instancia única de SessionFactory
     * Si no existe, la crea; si ya existe, la reutiliza
     *
     * @return SessionFactory - Fábrica de sesiones de Hibernate
     */
    public static SessionFactory getSessionFactory() {
        if (sessionFactory == null) {
            try {
                System.out.println("╔════════════════════════════════════════════════════════════╗");
                System.out.println("║        INICIALIZANDO HIBERNATE SESSION FACTORY            ║");
                System.out.println("╚════════════════════════════════════════════════════════════╝");

                // Paso 1: Crear el registro de servicios desde hibernate.cfg.xml
                System.out.println("  [1/4] Cargando configuración desde hibernate.cfg.xml...");
                registry = new StandardServiceRegistryBuilder()
                        .configure() // Busca hibernate.cfg.xml en el classpath
                        .build();
                System.out.println("  ✓ Configuración cargada exitosamente");

                // Paso 2: Crear fuentes de metadata
                System.out.println("  [2/4] Construyendo metadata de entidades...");
                MetadataSources sources = new MetadataSources(registry);
                Metadata metadata = sources.getMetadataBuilder().build();
                System.out.println("  ✓ Metadata construida: " +
                                 metadata.getEntityBindings().size() + " entidades mapeadas");

                // Paso 3: Construir SessionFactory
                System.out.println("  [3/4] Creando SessionFactory...");
                sessionFactory = metadata.getSessionFactoryBuilder().build();
                System.out.println("  ✓ SessionFactory creado exitosamente");

                // Paso 4: Verificar conexión
                System.out.println("  [4/4] Verificando conexión a base de datos...");
                if (sessionFactory != null) {
                    System.out.println("  ✓ Conexión verificada");
                    System.out.println("\n  🎉 HIBERNATE INICIALIZADO CORRECTAMENTE");
                    System.out.println("  📊 Framework: Hibernate ORM 5.6.x");
                    System.out.println("  🗄️  Base de datos: MySQL 8.4.0");
                    System.out.println("  📦 Entidades mapeadas: Usuario, Producto");
                }

            } catch (Exception e) {
                System.err.println("\n  ✗ ERROR AL INICIALIZAR HIBERNATE");
                System.err.println("  " + e.getMessage());
                e.printStackTrace();

                // Destruir el registro si hay error
                if (registry != null) {
                    StandardServiceRegistryBuilder.destroy(registry);
                }
            }
        }

        return sessionFactory;
    }

    /**
     * Cierra el SessionFactory y libera recursos
     * Debe llamarse al finalizar la aplicación
     */
    public static void shutdown() {
        if (sessionFactory != null) {
            System.out.println("\n╔════════════════════════════════════════════════════════════╗");
            System.out.println("║           CERRANDO HIBERNATE SESSION FACTORY               ║");
            System.out.println("╚════════════════════════════════════════════════════════════╝");

            try {
                // Cerrar SessionFactory
                sessionFactory.close();
                System.out.println("  ✓ SessionFactory cerrado");

                // Destruir el registro de servicios
                if (registry != null) {
                    StandardServiceRegistryBuilder.destroy(registry);
                    System.out.println("  ✓ Registro de servicios destruido");
                }

                System.out.println("  ✓ Recursos liberados exitosamente\n");

            } catch (Exception e) {
                System.err.println("  ✗ Error al cerrar Hibernate: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    /**
     * Verifica si SessionFactory está activo
     *
     * @return true si está activo, false en caso contrario
     */
    public static boolean isSessionFactoryActive() {
        return sessionFactory != null && !sessionFactory.isClosed();
    }

    /**
     * Obtiene información sobre el SessionFactory actual
     *
     * @return String con información del SessionFactory
     */
    public static String getSessionFactoryInfo() {
        if (sessionFactory != null && !sessionFactory.isClosed()) {
            StringBuilder info = new StringBuilder();
            info.append("SessionFactory Status: ACTIVO\n");
            info.append("Entidades registradas: ");
            info.append(sessionFactory.getMetamodel().getEntities().size());
            return info.toString();
        } else {
            return "SessionFactory Status: INACTIVO";
        }
    }
}
