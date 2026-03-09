package com.cafebar.servlets.api;

import com.cafebar.config.DatabaseConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;

/**
 * API REST para Usuarios del Café Bar
 * Endpoints: GET /api/usuarios, POST, PUT, DELETE
 *
 * @author Andrés Felipe Gil Gallo / Carlos Alberto Ruiz Burbano / Juan Diego Ríos Franco
 * @version 1.0
 */
@WebServlet(name = "UsuariosAPIServlet", urlPatterns = {"/api/usuarios"})
public class UsuariosAPIServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res); res.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String idParam = req.getParameter("id");
        String rolParam = req.getParameter("rol");

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql;
            PreparedStatement pstmt;

            if (idParam != null) {
                sql = "SELECT * FROM usuarios WHERE usuario_id = ?";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(idParam));
            } else if (rolParam != null) {
                sql = "SELECT * FROM usuarios WHERE rol = ? ORDER BY nombre_completo";
                pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, rolParam);
            } else {
                sql = "SELECT * FROM usuarios ORDER BY nombre_completo";
                pstmt = conn.prepareStatement(sql);
            }

            ResultSet rs = pstmt.executeQuery();
            if (idParam != null) {
                if (rs.next()) {
                    out.print("{\"success\":true,\"data\":" + usuarioToJson(rs) + "}");
                } else {
                    res.setStatus(404);
                    out.print(ApiHelper.error("Usuario no encontrado"));
                }
            } else {
                StringBuilder items = new StringBuilder();
                boolean first = true;
                int count = 0;
                while (rs.next()) {
                    if (!first) items.append(",");
                    items.append(usuarioToJson(rs));
                    first = false;
                    count++;
                }
                out.print("{\"success\":true,\"data\":[" + items + "],\"count\":" + count + "}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al obtener usuarios"));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String nombre = ApiHelper.getJson(body, "nombre");
            String apellido = ApiHelper.getJson(body, "apellido");
            String nombreCompleto = (nombre != null ? nombre : "") + (apellido != null && !apellido.isEmpty() ? " " + apellido : "");
            String email = ApiHelper.getJson(body, "email");
            String password = ApiHelper.getJson(body, "password");
            String username = email != null ? email.split("@")[0] + "_" + (System.currentTimeMillis() % 10000) : "usuario_" + (System.currentTimeMillis() % 10000);
            String sql = "INSERT INTO usuarios (username, password_hash, nombre_completo, email, telefono, rol, activo) VALUES (?,?,?,?,?,?,?)";
            PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, username);
            pstmt.setString(2, password != null ? password : "123456");
            pstmt.setString(3, nombreCompleto);
            pstmt.setString(4, email);
            pstmt.setString(5, ApiHelper.getJson(body, "telefono"));
            pstmt.setString(6, ApiHelper.getJson(body, "rol") != null ? ApiHelper.getJson(body, "rol") : "cliente");
            pstmt.setBoolean(7, !"false".equals(ApiHelper.getJson(body, "activo")));
            pstmt.executeUpdate();
            ResultSet keys = pstmt.getGeneratedKeys();
            int id = keys.next() ? keys.getInt(1) : 0;
            out.print("{\"success\":true,\"id\":" + id + ",\"message\":\"Usuario creado\"}");
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al crear usuario: " + e.getMessage()));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String nombre = ApiHelper.getJson(body, "nombre");
            String apellido = ApiHelper.getJson(body, "apellido");
            String nombreCompleto = (nombre != null ? nombre : "") + (apellido != null && !apellido.isEmpty() ? " " + apellido : "");
            String password = ApiHelper.getJson(body, "password");

            String sql;
            PreparedStatement pstmt;
            if (password != null && !password.isEmpty()) {
                sql = "UPDATE usuarios SET nombre_completo=?, email=?, telefono=?, rol=?, activo=?, password_hash=? WHERE usuario_id=?";
                pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, nombreCompleto);
                pstmt.setString(2, ApiHelper.getJson(body, "email"));
                pstmt.setString(3, ApiHelper.getJson(body, "telefono"));
                pstmt.setString(4, ApiHelper.getJson(body, "rol") != null ? ApiHelper.getJson(body, "rol") : "cliente");
                pstmt.setBoolean(5, !"false".equals(ApiHelper.getJson(body, "activo")));
                pstmt.setString(6, password);
                pstmt.setInt(7, Integer.parseInt(ApiHelper.getJson(body, "id") != null ? ApiHelper.getJson(body, "id") : "0"));
            } else {
                sql = "UPDATE usuarios SET nombre_completo=?, email=?, telefono=?, rol=?, activo=? WHERE usuario_id=?";
                pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, nombreCompleto);
                pstmt.setString(2, ApiHelper.getJson(body, "email"));
                pstmt.setString(3, ApiHelper.getJson(body, "telefono"));
                pstmt.setString(4, ApiHelper.getJson(body, "rol") != null ? ApiHelper.getJson(body, "rol") : "cliente");
                pstmt.setBoolean(5, !"false".equals(ApiHelper.getJson(body, "activo")));
                pstmt.setInt(6, Integer.parseInt(ApiHelper.getJson(body, "id") != null ? ApiHelper.getJson(body, "id") : "0"));
            }
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Usuario actualizado"));
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al actualizar usuario"));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String id = req.getParameter("id");
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement("DELETE FROM usuarios WHERE usuario_id=?")) {
            pstmt.setInt(1, Integer.parseInt(id));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Usuario eliminado"));
        } catch (Exception e) {
            res.setStatus(500);
            out.print(ApiHelper.error("Error al eliminar usuario"));
        }
    }

    private String usuarioToJson(ResultSet rs) throws SQLException {
        String nombreCompleto = rs.getString("nombre_completo");
        String[] partes = nombreCompleto != null ? nombreCompleto.split(" ", 2) : new String[]{"", ""};
        String nombre = partes.length > 0 ? partes[0] : "";
        String apellido = partes.length > 1 ? partes[1] : "";
        return "{" +
            "\"idUsuario\":" + rs.getInt("usuario_id") + "," +
            "\"nombre\":\"" + ApiHelper.esc(nombre) + "\"," +
            "\"apellido\":\"" + ApiHelper.esc(apellido) + "\"," +
            "\"nombreCompleto\":\"" + ApiHelper.esc(nombreCompleto) + "\"," +
            "\"email\":\"" + ApiHelper.esc(rs.getString("email")) + "\"," +
            "\"telefono\":\"" + ApiHelper.esc(rs.getString("telefono")) + "\"," +
            "\"rol\":\"" + ApiHelper.esc(rs.getString("rol")) + "\"," +
            "\"activo\":" + rs.getBoolean("activo") +
            "}";
    }
}
