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
 * API REST para Reservas del Café Bar
 * Endpoints: GET /api/reservas, POST, PUT, DELETE
 *
 * @author Andrés Felipe Gil Gallo
 * @version 1.0
 */
@WebServlet(name = "ReservasAPIServlet", urlPatterns = {"/api/reservas"})
public class ReservasAPIServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res); res.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String idParam = req.getParameter("id");
        String usuarioParam = req.getParameter("usuario");
        String clienteParam = req.getParameter("cliente");
        String estadoParam = req.getParameter("estado");

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql;
            PreparedStatement pstmt;

            if (idParam != null) {
                sql = "SELECT * FROM reservas WHERE reserva_id = ?";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(idParam));
            } else if (usuarioParam != null) {
                // Buscar por usuario_id a través de la tabla clientes
                sql = "SELECT r.* FROM reservas r INNER JOIN clientes c ON r.cliente_id = c.cliente_id WHERE c.usuario_id = ? ORDER BY r.fecha_reserva DESC";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(usuarioParam));
            } else if (clienteParam != null) {
                sql = "SELECT * FROM reservas WHERE cliente_id = ? ORDER BY fecha_reserva DESC";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(clienteParam));
            } else if (estadoParam != null) {
                sql = "SELECT * FROM reservas WHERE estado = ? ORDER BY fecha_reserva ASC";
                pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, estadoParam);
            } else {
                sql = "SELECT * FROM reservas ORDER BY fecha_reserva ASC";
                pstmt = conn.prepareStatement(sql);
            }

            ResultSet rs = pstmt.executeQuery();
            if (idParam != null) {
                if (rs.next()) {
                    out.print("{\"success\":true,\"data\":" + reservaToJson(rs) + "}");
                } else {
                    res.setStatus(404);
                    out.print(ApiHelper.error("Reserva no encontrada"));
                }
            } else {
                StringBuilder items = new StringBuilder();
                boolean first = true;
                int count = 0;
                while (rs.next()) {
                    if (!first) items.append(",");
                    items.append(reservaToJson(rs));
                    first = false;
                    count++;
                }
                out.print("{\"success\":true,\"data\":[" + items + "],\"count\":" + count + "}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al obtener reservas"));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String codigoConfirmacion = "R" + String.format("%07d", System.currentTimeMillis() % 10000000);
            String sql = "INSERT INTO reservas (cliente_id, mesa_id, fecha_reserva, hora_reserva, numero_personas, duracion_estimada, estado, codigo_confirmacion) VALUES (?,?,?,?,?,?,?,?)";
            PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);

            String clienteId = ApiHelper.getJson(body, "clienteId");
            if (clienteId != null && !clienteId.equals("null")) {
                pstmt.setInt(1, Integer.parseInt(clienteId));
            } else {
                pstmt.setNull(1, Types.INTEGER);
            }

            String idMesa = ApiHelper.getJson(body, "idMesa");
            if (idMesa != null) {
                pstmt.setInt(2, Integer.parseInt(idMesa));
            } else {
                pstmt.setNull(2, Types.INTEGER);
            }

            pstmt.setString(3, ApiHelper.getJson(body, "fechaReserva"));
            pstmt.setString(4, ApiHelper.getJson(body, "horaReserva"));
            pstmt.setInt(5, Integer.parseInt(ApiHelper.getJson(body, "numeroPersonas") != null ? ApiHelper.getJson(body, "numeroPersonas") : "1"));

            String duracion = ApiHelper.getJson(body, "duracionEstimada");
            if (duracion != null && !duracion.equals("null")) {
                pstmt.setInt(6, Integer.parseInt(duracion));
            } else {
                pstmt.setNull(6, Types.INTEGER);
            }

            pstmt.setString(7, "pendiente");
            pstmt.setString(8, codigoConfirmacion);
            pstmt.executeUpdate();

            ResultSet keys = pstmt.getGeneratedKeys();
            int id = keys.next() ? keys.getInt(1) : 0;
            out.print("{\"success\":true,\"id\":" + id + ",\"codigoConfirmacion\":\"" + codigoConfirmacion + "\",\"message\":\"Reserva creada\"}");
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al crear reserva: " + e.getMessage()));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String estado = ApiHelper.getJson(body, "estado");
            String idStr = ApiHelper.getJson(body, "id");
            if (idStr == null) idStr = ApiHelper.getJson(body, "idReserva");

            if (estado == null) estado = "pendiente";

            String sql = "UPDATE reservas SET estado=? WHERE reserva_id=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, estado);
            pstmt.setInt(2, Integer.parseInt(idStr != null ? idStr : "0"));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Reserva actualizada"));
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al actualizar reserva"));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String id = req.getParameter("id");
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement("DELETE FROM reservas WHERE reserva_id=?")) {
            pstmt.setInt(1, Integer.parseInt(id));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Reserva eliminada"));
        } catch (Exception e) {
            res.setStatus(500);
            out.print(ApiHelper.error("Error al eliminar reserva"));
        }
    }

    private String reservaToJson(ResultSet rs) throws SQLException {
        Date fechaReserva = rs.getDate("fecha_reserva");
        Time horaReserva = rs.getTime("hora_reserva");
        return "{" +
            "\"idReserva\":" + rs.getInt("reserva_id") + "," +
            "\"clienteId\":" + rs.getInt("cliente_id") + "," +
            "\"idMesa\":" + rs.getInt("mesa_id") + "," +
            "\"fechaReserva\":\"" + (fechaReserva != null ? fechaReserva.toString() : "") + "\"," +
            "\"horaReserva\":\"" + (horaReserva != null ? horaReserva.toString() : "") + "\"," +
            "\"numeroPersonas\":" + rs.getInt("numero_personas") + "," +
            "\"duracionEstimada\":" + rs.getInt("duracion_estimada") + "," +
            "\"codigoConfirmacion\":\"" + ApiHelper.esc(rs.getString("codigo_confirmacion")) + "\"," +
            "\"estado\":\"" + ApiHelper.esc(rs.getString("estado")) + "\"" +
            "}";
    }
}
