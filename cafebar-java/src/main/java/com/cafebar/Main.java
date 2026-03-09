package com.cafebar;

import com.cafebar.config.DatabaseConnection;
import com.cafebar.dao.ProductoDAO;
import com.cafebar.dao.UsuarioDAO;
import com.cafebar.models.Producto;
import com.cafebar.models.Usuario;

import java.math.BigDecimal;
import java.sql.Connection;
import java.util.List;
import java.util.Scanner;

/**
 * Clase principal que demuestra la conexión JDBC y operaciones CRUD
 * Sistema de Gestión Café Bar
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class Main {

    private static Scanner scanner = new Scanner(System.in);
    private static UsuarioDAO usuarioDAO = new UsuarioDAO();
    private static ProductoDAO productoDAO = new ProductoDAO();

    public static void main(String[] args) {
        System.out.println("╔════════════════════════════════════════════════════════════╗");
        System.out.println("║     SISTEMA DE GESTIÓN CAFÉ BAR - DEMOSTRACIÓN JDBC       ║");
        System.out.println("║              Conexión y Operaciones CRUD                   ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝");
        System.out.println();

        // PASO 1: Probar la conexión a la base de datos
        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("PASO 1: PROBAR CONEXIÓN A BASE DE DATOS");
        System.out.println("═══════════════════════════════════════════════════════════");
        probarConexion();

        // Menú principal
        boolean continuar = true;
        while (continuar) {
            mostrarMenu();
            int opcion = leerOpcion();

            switch (opcion) {
                case 1:
                    demoCRUDUsuarios();
                    break;
                case 2:
                    demoCRUDProductos();
                    break;
                case 3:
                    demoConsultasAvanzadas();
                    break;
                case 4:
                    demoAutenticacion();
                    break;
                case 5:
                    probarConexion();
                    break;
                case 0:
                    continuar = false;
                    System.out.println("\n✓ Cerrando aplicación...");
                    cerrarConexion();
                    break;
                default:
                    System.out.println("\n✗ Opción inválida");
            }

            if (continuar) {
                System.out.println("\nPresione Enter para continuar...");
                scanner.nextLine();
            }
        }

        scanner.close();
        System.out.println("\n¡Hasta luego!");
    }

    /**
     * PASO 1: Probar la conexión JDBC a la base de datos
     */
    private static void probarConexion() {
        try {
            // 1. Obtener instancia de DatabaseConnection (Singleton)
            DatabaseConnection dbConnection = DatabaseConnection.getInstance();
            System.out.println("  1. ✓ Instancia de DatabaseConnection obtenida");

            // 2. Obtener la conexión
            Connection conn = dbConnection.getConnection();
            System.out.println("  2. ✓ Conexión obtenida");

            // 3. Verificar que la conexión esté activa
            if (conn != null && !conn.isClosed()) {
                System.out.println("  3. ✓ Conexión activa y funcionando");

                // 4. Obtener información de la base de datos
                System.out.println("\n  📊 Información de la Base de Datos:");
                System.out.println("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                System.out.println("  • Driver: " + dbConnection.getDriver());
                System.out.println("  • URL: " + dbConnection.getUrl());
                System.out.println("  • Usuario: " + dbConnection.getUsername());
                System.out.println("  • Producto BD: " + conn.getMetaData().getDatabaseProductName());
                System.out.println("  • Versión: " + conn.getMetaData().getDatabaseProductVersion());
                System.out.println("  • Catálogo: " + conn.getCatalog());
                System.out.println();
                System.out.println("  ✓ CONEXIÓN JDBC EXITOSA");
            }

        } catch (Exception e) {
            System.err.println("  ✗ Error en la conexión:");
            System.err.println("  " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Demostración CRUD completa para Usuarios
     */
    private static void demoCRUDUsuarios() {
        System.out.println("\n═══════════════════════════════════════════════════════════");
        System.out.println("DEMOSTRACIÓN: CRUD DE USUARIOS");
        System.out.println("═══════════════════════════════════════════════════════════\n");

        // CREATE - Crear nuevo usuario
        System.out.println("─── CREATE: Insertar nuevo usuario ───");
        Usuario nuevoUsuario = new Usuario(
            "pedro_gonzalez",
            "password123",
            "mesero",
            "Pedro González"
        );
        nuevoUsuario.setTelefono("3101234567");
        nuevoUsuario.setEmail("pedro.gonzalez@cafebar.com");
        nuevoUsuario.setActivo(true);

        int idNuevo = usuarioDAO.crear(nuevoUsuario);
        if (idNuevo > 0) {
            System.out.println("  Usuario creado con ID: " + idNuevo);
            nuevoUsuario.setUsuarioId(idNuevo);
        }

        // READ - Leer usuario por ID
        System.out.println("\n─── READ: Obtener usuario por ID ───");
        Usuario usuarioLeido = usuarioDAO.obtenerPorId(idNuevo);
        if (usuarioLeido != null) {
            System.out.println("  " + usuarioLeido);
        }

        // READ - Listar todos los usuarios
        System.out.println("\n─── READ: Listar todos los usuarios ───");
        List<Usuario> usuarios = usuarioDAO.obtenerTodos();
        System.out.println("  Total de usuarios: " + usuarios.size());
        for (Usuario u : usuarios) {
            System.out.println("  • ID: " + u.getUsuarioId() + " | " + u.getNombreCompleto() +
                             " | " + u.getEmail() + " | Rol: " + u.getRol());
        }

        // UPDATE - Actualizar usuario
        System.out.println("\n─── UPDATE: Actualizar datos del usuario ───");
        usuarioLeido.setNombreCompleto("Pedro González Actualizado");
        usuarioLeido.setTelefono("3109999999");
        boolean actualizado = usuarioDAO.actualizar(usuarioLeido);
        if (actualizado) {
            System.out.println("  Usuario actualizado: " + usuarioLeido.getNombreCompleto());
        }

        // READ - Obtener por rol
        System.out.println("\n─── READ: Obtener usuarios por rol (mesero) ───");
        List<Usuario> meseros = usuarioDAO.obtenerPorRol("mesero");
        System.out.println("  Total de meseros: " + meseros.size());
        for (Usuario t : meseros) {
            System.out.println("  • " + t.getNombreCompleto() + " - " + t.getEmail());
        }

        // DELETE - Eliminar usuario (opcional)
        System.out.print("\n¿Desea eliminar el usuario creado? (s/n): ");
        String respuesta = scanner.nextLine().trim().toLowerCase();
        if (respuesta.equals("s")) {
            System.out.println("\n─── DELETE: Eliminar usuario ───");
            boolean eliminado = usuarioDAO.eliminar(idNuevo);
            if (eliminado) {
                System.out.println("  Usuario eliminado exitosamente");
            }
        }
    }

    /**
     * Demostración CRUD completa para Productos
     */
    private static void demoCRUDProductos() {
        System.out.println("\n═══════════════════════════════════════════════════════════");
        System.out.println("DEMOSTRACIÓN: CRUD DE PRODUCTOS");
        System.out.println("═══════════════════════════════════════════════════════════\n");

        // CREATE - Crear nuevo producto
        System.out.println("─── CREATE: Insertar nuevo producto ───");
        Producto nuevoProducto = new Producto();
        nuevoProducto.setCategoriaId(1); // Categoría Café
        nuevoProducto.setNombre("Espresso Doble");
        nuevoProducto.setDescripcion("Espresso doble concentrado");
        nuevoProducto.setPrecio(new BigDecimal("6000.00"));
        nuevoProducto.setCosto(new BigDecimal("2000.00"));
        nuevoProducto.setDisponible(true);
        nuevoProducto.setTiempoPreparacion(5);
        nuevoProducto.setStock(50);
        nuevoProducto.setStockMinimo(10);

        int idProducto = productoDAO.crear(nuevoProducto);
        if (idProducto > 0) {
            System.out.println("  Producto creado con ID: " + idProducto);
            nuevoProducto.setProductoId(idProducto);
        }

        // READ - Leer producto por ID
        System.out.println("\n─── READ: Obtener producto por ID ───");
        Producto productoLeido = productoDAO.obtenerPorId(idProducto);
        if (productoLeido != null) {
            System.out.println("  " + productoLeido);
            System.out.println("  Margen de ganancia: " + productoLeido.calcularMargen() + "%");
        }

        // READ - Listar todos los productos
        System.out.println("\n─── READ: Listar todos los productos ───");
        List<Producto> productos = productoDAO.obtenerTodos();
        System.out.println("  Total de productos: " + productos.size());
        for (Producto p : productos) {
            System.out.println("  • ID: " + p.getProductoId() + " | " + p.getNombre() +
                             " | $" + p.getPrecio() + " | Categoría: " + p.getNombreCategoria() +
                             " | Stock: " + p.getStock());
        }

        // READ - Productos por categoría
        System.out.println("\n─── READ: Productos de categoría Café (ID: 1) ───");
        List<Producto> productosCafe = productoDAO.obtenerPorCategoria(1);
        System.out.println("  Total de productos de café: " + productosCafe.size());
        for (Producto p : productosCafe) {
            System.out.println("  • " + p.getNombre() + " - $" + p.getPrecio());
        }

        // UPDATE - Actualizar producto
        System.out.println("\n─── UPDATE: Actualizar precio y stock ───");
        productoLeido.setPrecio(new BigDecimal("6500.00"));
        productoLeido.setStock(45);
        boolean actualizado = productoDAO.actualizar(productoLeido);
        if (actualizado) {
            System.out.println("  Producto actualizado: " + productoLeido.getNombre());
            System.out.println("  Nuevo precio: $" + productoLeido.getPrecio());
        }

        // READ - Productos con stock bajo
        System.out.println("\n─── READ: Productos con stock bajo ───");
        List<Producto> stockBajo = productoDAO.obtenerConStockBajo();
        if (stockBajo.isEmpty()) {
            System.out.println("  No hay productos con stock bajo");
        } else {
            System.out.println("  ⚠ Productos que necesitan reabastecimiento:");
            for (Producto p : stockBajo) {
                System.out.println("  • " + p.getNombre() +
                                 " | Stock: " + p.getStock() +
                                 " | Mínimo: " + p.getStockMinimo());
            }
        }

        // DELETE - Eliminar producto (opcional)
        System.out.print("\n¿Desea eliminar el producto creado? (s/n): ");
        String respuesta = scanner.nextLine().trim().toLowerCase();
        if (respuesta.equals("s")) {
            System.out.println("\n─── DELETE: Eliminar producto ───");
            boolean eliminado = productoDAO.eliminar(idProducto);
            if (eliminado) {
                System.out.println("  Producto eliminado exitosamente");
            }
        }
    }

    /**
     * Demostración de consultas avanzadas
     */
    private static void demoConsultasAvanzadas() {
        System.out.println("\n═══════════════════════════════════════════════════════════");
        System.out.println("DEMOSTRACIÓN: CONSULTAS AVANZADAS");
        System.out.println("═══════════════════════════════════════════════════════════\n");

        // Búsqueda de productos
        System.out.println("─── Búsqueda de productos ───");
        System.out.print("Ingrese término de búsqueda: ");
        String termino = scanner.nextLine();
        List<Producto> resultados = productoDAO.buscarPorNombre(termino);
        System.out.println("\nResultados encontrados: " + resultados.size());
        for (Producto p : resultados) {
            System.out.println("  • " + p.getNombre() + " - " + p.getDescripcion());
        }

        // Productos disponibles
        System.out.println("\n─── Productos disponibles para venta ───");
        List<Producto> disponibles = productoDAO.obtenerDisponibles();
        System.out.println("  Total disponibles: " + disponibles.size());

        // Contar usuarios
        System.out.println("\n─── Estadísticas de usuarios ───");
        int totalUsuarios = usuarioDAO.contarUsuarios();
        System.out.println("  Total de usuarios registrados: " + totalUsuarios);

        // Usuarios por rol
        String[] roles = {"administrador", "gerente", "mesero", "chef", "cajero", "barista"};
        for (String rol : roles) {
            List<Usuario> porRol = usuarioDAO.obtenerPorRol(rol);
            if (porRol.size() > 0) {
                System.out.println("  • " + rol + "s: " + porRol.size());
            }
        }
    }

    /**
     * Demostración de autenticación
     */
    private static void demoAutenticacion() {
        System.out.println("\n═══════════════════════════════════════════════════════════");
        System.out.println("DEMOSTRACIÓN: SISTEMA DE AUTENTICACIÓN");
        System.out.println("═══════════════════════════════════════════════════════════\n");

        System.out.print("Username: ");
        String username = scanner.nextLine();
        System.out.print("Contraseña: ");
        String password = scanner.nextLine();

        Usuario usuario = usuarioDAO.autenticar(username, password);

        if (usuario != null) {
            System.out.println("\n✓ AUTENTICACIÓN EXITOSA");
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            System.out.println("Bienvenido: " + usuario.getNombreCompleto());
            System.out.println("Email: " + usuario.getEmail());
            System.out.println("Rol: " + usuario.getRol().toUpperCase());
            System.out.println("Activo: " + (usuario.isActivo() ? "Sí" : "No"));
        } else {
            System.out.println("\n✗ AUTENTICACIÓN FALLIDA");
            System.out.println("Credenciales incorrectas o usuario inactivo");
        }
    }

    /**
     * Muestra el menú principal
     */
    private static void mostrarMenu() {
        System.out.println("\n╔════════════════════════════════════════════════════════════╗");
        System.out.println("║                      MENÚ PRINCIPAL                        ║");
        System.out.println("╠════════════════════════════════════════════════════════════╣");
        System.out.println("║  1. Demostración CRUD de Usuarios                          ║");
        System.out.println("║  2. Demostración CRUD de Productos                         ║");
        System.out.println("║  3. Consultas Avanzadas                                    ║");
        System.out.println("║  4. Probar Autenticación                                   ║");
        System.out.println("║  5. Probar Conexión JDBC                                   ║");
        System.out.println("║  0. Salir                                                  ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝");
        System.out.print("\nSeleccione una opción: ");
    }

    /**
     * Lee una opción del menú
     */
    private static int leerOpcion() {
        try {
            String input = scanner.nextLine();
            return Integer.parseInt(input);
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    /**
     * Cierra la conexión a la base de datos
     */
    private static void cerrarConexion() {
        DatabaseConnection.getInstance().closeConnection();
    }
}
