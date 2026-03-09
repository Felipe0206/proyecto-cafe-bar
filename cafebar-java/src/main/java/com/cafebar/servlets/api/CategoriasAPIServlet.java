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
 * API REST para Categorías del menú
 * Endpoint: GET /api/categorias
 *
 * @author Andrés Felipe Gil Gallo / Carlos Alberto Ruiz Burbano / Juan Diego Ríos Franco
 * @version 1.0
 */
@WebServlet(name = "CategoriasAPIServlet", urlPatterns = {"/api/categorias"})
public class CategoriasAPIServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        res.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        boolean soloActivas = "true".equals(req.getParameter("activas"));

        String sql = soloActivas
            ? "SELECT * FROM categorias WHERE activo = 1 ORDER BY orden"
            : "SELECT * FROM categorias ORDER BY orden";

        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            StringBuilder items = new StringBuilder();
            boolean first = true;
            int count = 0;
            while (rs.next()) {
                if (!first) items.append(",");
                items.append("{")
                    .append("\"idCategoria\":").append(rs.getInt("categoria_id")).append(",")
                    .append("\"nombre\":\"").append(ApiHelper.esc(rs.getString("nombre"))).append("\",")
                    .append("\"descripcion\":\"").append(ApiHelper.esc(rs.getString("descripcion"))).append("\",")
                    .append("\"icono\":\"").append(ApiHelper.esc(rs.getString("icono"))).append("\",")
                    .append("\"orden\":").append(rs.getInt("orden")).append(",")
                    .append("\"activo\":").append(rs.getBoolean("activo"))
                    .append("}");
                first = false;
                count++;
            }
            out.print("{\"success\":true,\"data\":[" + items + "],\"count\":" + count + "}");

        } catch (SQLException e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al obtener categorías"));
        }
    }
}
