package com.cafebar.dao;

import com.cafebar.config.DatabaseConnection;
import com.cafebar.models.Producto;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase DAO (Data Access Object) para la entidad Producto
 * Implementa operaciones CRUD completas usando JDBC
 * Adaptada al esquema cafe_bar_db
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class ProductoDAO {

    private DatabaseConnection dbConnection;

    public ProductoDAO() {
        this.dbConnection = DatabaseConnection.getInstance();
    }

    /**
     * CREATE - Inserta un nuevo producto en la base de datos
     * @param producto Objeto Producto a insertar
     * @return ID del producto creado, o -1 si hubo error
     */
    public int crear(Producto producto) {
        String sql = "INSERT INTO productos (categoria_id, nombre, descripcion, precio, costo, " +
                     "imagen_url, disponible, tiempo_preparacion, stock, stock_minimo) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setInt(1, producto.getCategoriaId());
            pstmt.setString(2, producto.getNombre());
            pstmt.setString(3, producto.getDescripcion());
            pstmt.setBigDecimal(4, producto.getPrecio());
            pstmt.setBigDecimal(5, producto.getCosto());
            pstmt.setString(6, producto.getImagenUrl());
            pstmt.setBoolean(7, producto.isDisponible());
            pstmt.setInt(8, producto.getTiempoPreparacion());
            pstmt.setInt(9, producto.getStock());
            pstmt.setInt(10, producto.getStockMinimo());

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                try (ResultSet rs = pstmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        int idGenerado = rs.getInt(1);
                        System.out.println("✓ Producto creado exitosamente con ID: " + idGenerado);
                        return idGenerado;
                    }
                }
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al crear producto: " + e.getMessage());
            e.printStackTrace();
        }

        return -1;
    }

    /**
     * READ - Obtiene un producto por su ID
     * @param productoId ID del producto a buscar
     * @return Objeto Producto o null si no se encuentra
     */
    public Producto obtenerPorId(int productoId) {
        String sql = "SELECT p.*, c.nombre as nombre_categoria " +
                     "FROM productos p " +
                     "INNER JOIN categorias c ON p.categoria_id = c.categoria_id " +
                     "WHERE p.producto_id = ?";
        Producto producto = null;

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, productoId);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    producto = mapearProducto(rs);
                    System.out.println("✓ Producto encontrado: " + producto.getNombre());
                }
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener producto por ID: " + e.getMessage());
            e.printStackTrace();
        }

        return producto;
    }

    /**
     * READ - Obtiene todos los productos
     * @return Lista de todos los productos
     */
    public List<Producto> obtenerTodos() {
        String sql = "SELECT p.*, c.nombre as nombre_categoria " +
                     "FROM productos p " +
                     "INNER JOIN categorias c ON p.categoria_id = c.categoria_id " +
                     "ORDER BY p.nombre";
        List<Producto> productos = new ArrayList<>();

        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                productos.add(mapearProducto(rs));
            }

            System.out.println("✓ Se encontraron " + productos.size() + " productos");

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener todos los productos: " + e.getMessage());
            e.printStackTrace();
        }

        return productos;
    }

    /**
     * READ - Obtiene productos por categoría
     * @param categoriaId ID de la categoría
     * @return Lista de productos de esa categoría
     */
    public List<Producto> obtenerPorCategoria(int categoriaId) {
        String sql = "SELECT p.*, c.nombre as nombre_categoria " +
                     "FROM productos p " +
                     "INNER JOIN categorias c ON p.categoria_id = c.categoria_id " +
                     "WHERE p.categoria_id = ? " +
                     "ORDER BY p.nombre";
        List<Producto> productos = new ArrayList<>();

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, categoriaId);

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    productos.add(mapearProducto(rs));
                }
            }

            System.out.println("✓ Se encontraron " + productos.size() + " productos en la categoría");

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener productos por categoría: " + e.getMessage());
            e.printStackTrace();
        }

        return productos;
    }

    /**
     * READ - Obtiene productos disponibles
     * @return Lista de productos disponibles
     */
    public List<Producto> obtenerDisponibles() {
        String sql = "SELECT p.*, c.nombre as nombre_categoria " +
                     "FROM productos p " +
                     "INNER JOIN categorias c ON p.categoria_id = c.categoria_id " +
                     "WHERE p.disponible = TRUE " +
                     "ORDER BY p.nombre";
        List<Producto> productos = new ArrayList<>();

        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                productos.add(mapearProducto(rs));
            }

            System.out.println("✓ Se encontraron " + productos.size() + " productos disponibles");

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener productos disponibles: " + e.getMessage());
            e.printStackTrace();
        }

        return productos;
    }

    /**
     * READ - Obtiene productos con stock bajo
     * @return Lista de productos que necesitan reabastecimiento
     */
    public List<Producto> obtenerConStockBajo() {
        String sql = "SELECT p.*, c.nombre as nombre_categoria " +
                     "FROM productos p " +
                     "INNER JOIN categorias c ON p.categoria_id = c.categoria_id " +
                     "WHERE p.stock <= p.stock_minimo " +
                     "ORDER BY p.stock ASC";
        List<Producto> productos = new ArrayList<>();

        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                productos.add(mapearProducto(rs));
            }

            System.out.println("⚠ Se encontraron " + productos.size() + " productos con stock bajo");

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener productos con stock bajo: " + e.getMessage());
            e.printStackTrace();
        }

        return productos;
    }

    /**
     * UPDATE - Actualiza los datos de un producto
     * @param producto Producto con los datos actualizados
     * @return true si se actualizó correctamente, false en caso contrario
     */
    public boolean actualizar(Producto producto) {
        String sql = "UPDATE productos SET categoria_id = ?, nombre = ?, descripcion = ?, " +
                     "precio = ?, costo = ?, imagen_url = ?, disponible = ?, " +
                     "tiempo_preparacion = ?, stock = ?, stock_minimo = ? " +
                     "WHERE producto_id = ?";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, producto.getCategoriaId());
            pstmt.setString(2, producto.getNombre());
            pstmt.setString(3, producto.getDescripcion());
            pstmt.setBigDecimal(4, producto.getPrecio());
            pstmt.setBigDecimal(5, producto.getCosto());
            pstmt.setString(6, producto.getImagenUrl());
            pstmt.setBoolean(7, producto.isDisponible());
            pstmt.setInt(8, producto.getTiempoPreparacion());
            pstmt.setInt(9, producto.getStock());
            pstmt.setInt(10, producto.getStockMinimo());
            pstmt.setInt(11, producto.getProductoId());

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                System.out.println("✓ Producto actualizado exitosamente");
                return true;
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al actualizar producto: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * UPDATE - Actualiza el stock de un producto
     * @param productoId ID del producto
     * @param nuevoStock Nuevo valor de stock
     * @return true si se actualizó correctamente
     */
    public boolean actualizarStock(int productoId, int nuevoStock) {
        String sql = "UPDATE productos SET stock = ? WHERE producto_id = ?";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, nuevoStock);
            pstmt.setInt(2, productoId);

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                System.out.println("✓ Stock actualizado exitosamente");
                return true;
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al actualizar stock: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * DELETE - Elimina un producto por su ID
     * @param productoId ID del producto a eliminar
     * @return true si se eliminó correctamente, false en caso contrario
     */
    public boolean eliminar(int productoId) {
        String sql = "DELETE FROM productos WHERE producto_id = ?";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, productoId);

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                System.out.println("✓ Producto eliminado exitosamente");
                return true;
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al eliminar producto: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Método auxiliar para mapear ResultSet a objeto Producto
     * @param rs ResultSet con los datos
     * @return Objeto Producto
     * @throws SQLException si hay error al leer datos
     */
    private Producto mapearProducto(ResultSet rs) throws SQLException {
        Producto producto = new Producto();
        producto.setProductoId(rs.getInt("producto_id"));
        producto.setCategoriaId(rs.getInt("categoria_id"));
        producto.setNombre(rs.getString("nombre"));
        producto.setDescripcion(rs.getString("descripcion"));
        producto.setPrecio(rs.getBigDecimal("precio"));
        producto.setCosto(rs.getBigDecimal("costo"));
        producto.setImagenUrl(rs.getString("imagen_url"));
        producto.setDisponible(rs.getBoolean("disponible"));
        producto.setTiempoPreparacion(rs.getInt("tiempo_preparacion"));
        producto.setStock(rs.getInt("stock"));
        producto.setStockMinimo(rs.getInt("stock_minimo"));
        producto.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
        producto.setFechaActualizacion(rs.getTimestamp("fecha_actualizacion"));
        producto.setNombreCategoria(rs.getString("nombre_categoria"));
        return producto;
    }

    /**
     * Busca productos por nombre
     * @param termino Término de búsqueda
     * @return Lista de productos que coinciden
     */
    public List<Producto> buscarPorNombre(String termino) {
        String sql = "SELECT p.*, c.nombre as nombre_categoria " +
                     "FROM productos p " +
                     "INNER JOIN categorias c ON p.categoria_id = c.categoria_id " +
                     "WHERE p.nombre LIKE ? OR p.descripcion LIKE ? " +
                     "ORDER BY p.nombre";
        List<Producto> productos = new ArrayList<>();

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            String patron = "%" + termino + "%";
            pstmt.setString(1, patron);
            pstmt.setString(2, patron);

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    productos.add(mapearProducto(rs));
                }
            }

            System.out.println("✓ Búsqueda completada: " + productos.size() + " resultados");

        } catch (SQLException e) {
            System.err.println("✗ Error en la búsqueda: " + e.getMessage());
            e.printStackTrace();
        }

        return productos;
    }
}
