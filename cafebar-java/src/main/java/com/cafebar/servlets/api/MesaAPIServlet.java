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
 * API REST para Mesas del Café Bar
 * Endpoints: GET /api/mesas, POST, PUT, DELETE
 *
 * @author Andrés Felipe Gil Gallo / Carlos Alberto Ruiz Burbano / Juan Diego Ríos Franco
 * @version 1.0
 */
@WebServlet(name = "MesaAPIServlet", urlPatterns = {"/api/mesas"})
public class MesaAPIServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res); res.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String idParam = req.getParameter("id");
        String estadoParam = req.getParameter("estado");

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql;
            PreparedStatement pstmt;

            if (idParam != null) {
                sql = "SELECT mesa_id, numero_mesa, capacidad, ubicacion, estado, codigo_qr FROM mesas WHERE mesa_id = ?";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(idParam));
            } else if (estadoParam != null) {
                sql = "SELECT mesa_id, numero_mesa, capacidad, ubicacion, estado, codigo_qr FROM mesas WHERE estado = ? ORDER BY numero_mesa";
                pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, estadoParam);
            } else {
                sql = "SELECT mesa_id, numero_mesa, capacidad, ubicacion, estado, codigo_qr FROM mesas ORDER BY numero_mesa";
                pstmt = conn.prepareStatement(sql);
            }

            ResultSet rs = pstmt.executeQuery();
            if (idParam != null) {
                if (rs.next()) {
                    out.print("{\"success\":true,\"data\":" + mesaToJson(rs) + "}");
                } else {
                    res.setStatus(404);
                    out.print(ApiHelper.error("Mesa no encontrada"));
                }
            } else {
                StringBuilder items = new StringBuilder();
                boolean first = true;
                int count = 0;
                while (rs.next()) {
                    if (!first) items.append(",");
                    items.append(mesaToJson(rs));
                    first = false;
                    count++;
                }
                out.print("{\"success\":true,\"data\":[" + items + "],\"count\":" + count + "}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al obtener mesas"));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql = "INSERT INTO mesas (numero_mesa, capacidad, ubicacion, estado, codigo_qr) VALUES (?,?,?,?,?)";
            PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            pstmt.setInt(1, Integer.parseInt(ApiHelper.getJson(body, "numeroMesa") != null ? ApiHelper.getJson(body, "numeroMesa") : "0"));
            pstmt.setInt(2, Integer.parseInt(ApiHelper.getJson(body, "capacidad") != null ? ApiHelper.getJson(body, "capacidad") : "4"));
            pstmt.setString(3, ApiHelper.getJson(body, "ubicacion") != null ? ApiHelper.getJson(body, "ubicacion") : "interior");
            pstmt.setString(4, ApiHelper.getJson(body, "estado") != null ? ApiHelper.getJson(body, "estado") : "disponible");
            pstmt.setString(5, ApiHelper.getJson(body, "codigoQr"));
            pstmt.executeUpdate();
            ResultSet keys = pstmt.getGeneratedKeys();
            int id = keys.next() ? keys.getInt(1) : 0;
            out.print("{\"success\":true,\"id\":" + id + ",\"message\":\"Mesa creada\"}");
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al crear mesa"));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql = "UPDATE mesas SET estado=?, capacidad=?, ubicacion=?, codigo_qr=? WHERE mesa_id=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, ApiHelper.getJson(body, "estado") != null ? ApiHelper.getJson(body, "estado") : "disponible");
            pstmt.setInt(2, Integer.parseInt(ApiHelper.getJson(body, "capacidad") != null ? ApiHelper.getJson(body, "capacidad") : "4"));
            pstmt.setString(3, ApiHelper.getJson(body, "ubicacion") != null ? ApiHelper.getJson(body, "ubicacion") : "interior");
            pstmt.setString(4, ApiHelper.getJson(body, "codigoQr"));
            pstmt.setInt(5, Integer.parseInt(ApiHelper.getJson(body, "idMesa") != null ? ApiHelper.getJson(body, "idMesa") : "0"));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Mesa actualizada"));
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al actualizar mesa"));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String id = req.getParameter("id");
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement("DELETE FROM mesas WHERE mesa_id=?")) {
            pstmt.setInt(1, Integer.parseInt(id));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Mesa eliminada"));
        } catch (Exception e) {
            res.setStatus(500);
            out.print(ApiHelper.error("Error al eliminar mesa"));
        }
    }

    private String mesaToJson(ResultSet rs) throws SQLException {
        return "{" +
            "\"idMesa\":" + rs.getInt("mesa_id") + "," +
            "\"numeroMesa\":" + rs.getInt("numero_mesa") + "," +
            "\"capacidad\":" + rs.getInt("capacidad") + "," +
            "\"ubicacion\":\"" + ApiHelper.esc(rs.getString("ubicacion")) + "\"," +
            "\"estado\":\"" + ApiHelper.esc(rs.getString("estado")) + "\"," +
            "\"codigoQr\":\"" + ApiHelper.esc(rs.getString("codigo_qr")) + "\"" +
            "}";
    }
}
