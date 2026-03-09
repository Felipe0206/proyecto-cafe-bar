package com.cafebar.servlets.api;

import com.cafebar.config.DatabaseConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;

/**
 * API REST para autenticación desde el frontend React
 * Recibe JSON {email, password} y responde con JSON
 *
 * Endpoint: POST /api/login
 *
 * @author Andrés Felipe Gil Gallo / Carlos Alberto Ruiz Burbano / Juan Diego Ríos Franco
 * @version 1.0
 */
@WebServlet(name = "LoginAPIServlet", urlPatterns = {"/api/login"})
public class LoginAPIServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res); res.setStatus(200);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        ApiHelper.setCors(response);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Leer cuerpo JSON
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            String body = sb.toString();

            String email = ApiHelper.getJson(body, "email");
            String password = ApiHelper.getJson(body, "password");

            if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
                out.print("{\"success\":false,\"message\":\"Email y contraseña son requeridos\"}");
                return;
            }

            try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
                // Autenticar usuario directamente con JDBC
                PreparedStatement auth = conn.prepareStatement(
                    "SELECT usuario_id, nombre_completo, email, rol, activo FROM usuarios WHERE email = ? AND password_hash = ? AND activo = 1");
                auth.setString(1, email.trim());
                auth.setString(2, password);
                ResultSet rs = auth.executeQuery();

                if (rs.next()) {
                    int usuarioId = rs.getInt("usuario_id");
                    String nombre = rs.getString("nombre_completo");
                    String emailUser = rs.getString("email");
                    String rol = rs.getString("rol");
                    boolean activo = rs.getBoolean("activo");

                    // Obtener o crear registro en clientes vinculado a este usuario
                    int clienteId = obtenerOCrearCliente(conn, usuarioId, nombre, emailUser);

                    String json = "{\"success\":true,\"message\":\"Autenticación exitosa\",\"usuario\":{"
                            + "\"idUsuario\":" + usuarioId + ","
                            + "\"clienteId\":" + clienteId + ","
                            + "\"nombre\":\"" + esc(nombre) + "\","
                            + "\"email\":\"" + esc(emailUser) + "\","
                            + "\"rol\":\"" + esc(rol) + "\","
                            + "\"activo\":" + activo
                            + "}}";
                    out.print(json);
                    System.out.println("✓ API Login exitoso: " + email);
                } else {
                    out.print("{\"success\":false,\"message\":\"Email o contraseña incorrectos\"}");
                    System.out.println("✗ API Login fallido: " + email);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"success\":false,\"message\":\"Error interno del servidor\"}");
        }
    }

    // Busca cliente por usuario_id, si no existe lo crea
    private int obtenerOCrearCliente(Connection conn, int usuarioId, String nombre, String email) {
        try {
            // Buscar por usuario_id
            PreparedStatement buscar = conn.prepareStatement(
                "SELECT cliente_id FROM clientes WHERE usuario_id = ?");
            buscar.setInt(1, usuarioId);
            ResultSet rs = buscar.executeQuery();
            if (rs.next()) return rs.getInt("cliente_id");

            // Buscar por email
            PreparedStatement buscarEmail = conn.prepareStatement(
                "SELECT cliente_id FROM clientes WHERE email = ?");
            buscarEmail.setString(1, email);
            ResultSet rs2 = buscarEmail.executeQuery();
            if (rs2.next()) {
                int id = rs2.getInt("cliente_id");
                // Vincular usuario_id
                PreparedStatement vincular = conn.prepareStatement(
                    "UPDATE clientes SET usuario_id = ? WHERE cliente_id = ?");
                vincular.setInt(1, usuarioId);
                vincular.setInt(2, id);
                vincular.executeUpdate();
                return id;
            }

            // Crear nuevo cliente
            PreparedStatement crear = conn.prepareStatement(
                "INSERT INTO clientes (nombre, email, usuario_id) VALUES (?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS);
            crear.setString(1, nombre);
            crear.setString(2, email);
            crear.setInt(3, usuarioId);
            crear.executeUpdate();
            ResultSet keys = crear.getGeneratedKeys();
            return keys.next() ? keys.getInt(1) : 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
