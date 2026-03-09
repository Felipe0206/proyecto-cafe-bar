package com.cafebar.dao;

import com.cafebar.config.DatabaseConnection;
import com.cafebar.models.Usuario;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase DAO para la entidad Usuario
 * Adaptada al esquema cafe_bar_db
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class UsuarioDAO {

    private DatabaseConnection dbConnection;

    public UsuarioDAO() {
        this.dbConnection = DatabaseConnection.getInstance();
    }

    /**
     * CREATE - Inserta un nuevo usuario
     */
    public int crear(Usuario usuario) {
        String sql = "INSERT INTO usuarios (username, password_hash, rol, nombre_completo, email, telefono, activo) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, usuario.getUsername());
            pstmt.setString(2, usuario.getPasswordHash());
            pstmt.setString(3, usuario.getRol());
            pstmt.setString(4, usuario.getNombreCompleto());
            pstmt.setString(5, usuario.getEmail());
            pstmt.setString(6, usuario.getTelefono());
            pstmt.setBoolean(7, usuario.isActivo());

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                try (ResultSet rs = pstmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        int idGenerado = rs.getInt(1);
                        System.out.println("✓ Usuario creado exitosamente con ID: " + idGenerado);
                        return idGenerado;
                    }
                }
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al crear usuario: " + e.getMessage());
            e.printStackTrace();
        }

        return -1;
    }

    /**
     * READ - Obtiene un usuario por su ID
     */
    public Usuario obtenerPorId(int usuarioId) {
        String sql = "SELECT * FROM usuarios WHERE usuario_id = ?";
        Usuario usuario = null;

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, usuarioId);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    usuario = mapearUsuario(rs);
                    System.out.println("✓ Usuario encontrado: " + usuario.getNombreCompleto());
                }
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener usuario por ID: " + e.getMessage());
            e.printStackTrace();
        }

        return usuario;
    }

    /**
     * READ - Obtiene un usuario por username
     */
    public Usuario obtenerPorUsername(String username) {
        String sql = "SELECT * FROM usuarios WHERE username = ?";
        Usuario usuario = null;

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, username);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    usuario = mapearUsuario(rs);
                    System.out.println("✓ Usuario encontrado: " + usuario.getNombreCompleto());
                }
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener usuario por username: " + e.getMessage());
            e.printStackTrace();
        }

        return usuario;
    }

    /**
     * READ - Obtiene todos los usuarios
     */
    public List<Usuario> obtenerTodos() {
        String sql = "SELECT * FROM usuarios ORDER BY fecha_creacion DESC";
        List<Usuario> usuarios = new ArrayList<>();

        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                usuarios.add(mapearUsuario(rs));
            }

            System.out.println("✓ Se encontraron " + usuarios.size() + " usuarios");

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener todos los usuarios: " + e.getMessage());
            e.printStackTrace();
        }

        return usuarios;
    }

    /**
     * READ - Obtiene usuarios por rol
     */
    public List<Usuario> obtenerPorRol(String rol) {
        String sql = "SELECT * FROM usuarios WHERE rol = ? ORDER BY nombre_completo";
        List<Usuario> usuarios = new ArrayList<>();

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, rol);

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    usuarios.add(mapearUsuario(rs));
                }
            }

            System.out.println("✓ Se encontraron " + usuarios.size() + " usuarios con rol: " + rol);

        } catch (SQLException e) {
            System.err.println("✗ Error al obtener usuarios por rol: " + e.getMessage());
            e.printStackTrace();
        }

        return usuarios;
    }

    /**
     * UPDATE - Actualiza los datos de un usuario
     */
    public boolean actualizar(Usuario usuario) {
        String sql = "UPDATE usuarios SET username = ?, password_hash = ?, rol = ?, " +
                     "nombre_completo = ?, email = ?, telefono = ?, activo = ? " +
                     "WHERE usuario_id = ?";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, usuario.getUsername());
            pstmt.setString(2, usuario.getPasswordHash());
            pstmt.setString(3, usuario.getRol());
            pstmt.setString(4, usuario.getNombreCompleto());
            pstmt.setString(5, usuario.getEmail());
            pstmt.setString(6, usuario.getTelefono());
            pstmt.setBoolean(7, usuario.isActivo());
            pstmt.setInt(8, usuario.getUsuarioId());

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                System.out.println("✓ Usuario actualizado exitosamente");
                return true;
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al actualizar usuario: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * DELETE - Elimina un usuario por su ID
     */
    public boolean eliminar(int usuarioId) {
        String sql = "DELETE FROM usuarios WHERE usuario_id = ?";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, usuarioId);

            int filasAfectadas = pstmt.executeUpdate();

            if (filasAfectadas > 0) {
                System.out.println("✓ Usuario eliminado exitosamente");
                return true;
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al eliminar usuario: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Autenticación - Verifica email y password
     */
    public Usuario autenticar(String email, String passwordHash) {
        String sql = "SELECT * FROM usuarios WHERE email = ? AND password_hash = ? AND activo = 1";
        Usuario usuario = null;

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, email);
            pstmt.setString(2, passwordHash);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    usuario = mapearUsuario(rs);
                    System.out.println("✓ Autenticación exitosa: " + usuario.getNombreCompleto());

                    // Actualizar último acceso
                    actualizarUltimoAcceso(usuario.getUsuarioId());
                }
            }

        } catch (SQLException e) {
            System.err.println("✗ Error en autenticación: " + e.getMessage());
            e.printStackTrace();
        }

        return usuario;
    }

    /**
     * Actualiza la fecha de último acceso
     */
    private void actualizarUltimoAcceso(int usuarioId) {
        String sql = "UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE usuario_id = ?";

        try (Connection conn = dbConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, usuarioId);
            pstmt.executeUpdate();

        } catch (SQLException e) {
            System.err.println("✗ Error al actualizar último acceso: " + e.getMessage());
        }
    }

    /**
     * Mapea ResultSet a objeto Usuario
     */
    private Usuario mapearUsuario(ResultSet rs) throws SQLException {
        Usuario usuario = new Usuario();
        usuario.setUsuarioId(rs.getInt("usuario_id"));
        usuario.setUsername(rs.getString("username"));
        usuario.setPasswordHash(rs.getString("password_hash"));
        usuario.setRol(rs.getString("rol"));
        usuario.setNombreCompleto(rs.getString("nombre_completo"));
        usuario.setEmail(rs.getString("email"));
        usuario.setTelefono(rs.getString("telefono"));
        usuario.setActivo(rs.getBoolean("activo"));
        usuario.setFechaContratacion(rs.getDate("fecha_contratacion"));
        usuario.setSalario(rs.getBigDecimal("salario"));
        usuario.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
        usuario.setFechaActualizacion(rs.getTimestamp("fecha_actualizacion"));
        usuario.setUltimoAcceso(rs.getTimestamp("ultimo_acceso"));
        return usuario;
    }

    /**
     * Cuenta el total de usuarios
     */
    public int contarUsuarios() {
        String sql = "SELECT COUNT(*) as total FROM usuarios";
        int total = 0;

        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            if (rs.next()) {
                total = rs.getInt("total");
            }

        } catch (SQLException e) {
            System.err.println("✗ Error al contar usuarios: " + e.getMessage());
        }

        return total;
    }
}
