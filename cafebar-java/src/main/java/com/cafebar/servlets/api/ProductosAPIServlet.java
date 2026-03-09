package com.cafebar.servlets.api;

import com.cafebar.config.DatabaseConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.sql.*;

/**
 * API REST para Productos del Café Bar
 * Endpoints: GET /api/productos, POST, PUT, DELETE
 *
 * @author Andrés Felipe Gil Gallo / Carlos Alberto Ruiz Burbano / Juan Diego Ríos Franco
 * @version 1.0
 */
@WebServlet(name = "ProductosAPIServlet", urlPatterns = {"/api/productos"})
public class ProductosAPIServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res); res.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String categoriaParam = req.getParameter("categoria");
        String idParam = req.getParameter("id");

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql;
            PreparedStatement pstmt;

            if (idParam != null) {
                sql = "SELECT p.*, c.nombre as cat_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.categoria_id WHERE p.producto_id = ?";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(idParam));
            } else if (categoriaParam != null) {
                sql = "SELECT p.*, c.nombre as cat_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.categoria_id WHERE p.categoria_id = ? ORDER BY p.nombre";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(categoriaParam));
            } else {
                sql = "SELECT p.*, c.nombre as cat_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.categoria_id ORDER BY p.nombre";
                pstmt = conn.prepareStatement(sql);
            }

            ResultSet rs = pstmt.executeQuery();
            if (idParam != null) {
                // Single product
                if (rs.next()) {
                    out.print("{\"success\":true,\"data\":" + productoToJson(rs) + "}");
                } else {
                    res.setStatus(404);
                    out.print(ApiHelper.error("Producto no encontrado"));
                }
            } else {
                StringBuilder json = new StringBuilder("{\"success\":true,\"data\":[");
                boolean first = true;
                int count = 0;
                while (rs.next()) {
                    if (!first) json.append(",");
                    json.append(productoToJson(rs));
                    first = false;
                    count++;
                }
                json.append("],\"count\":").append(count).append("}");
                out.print(json.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al obtener productos"));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql = "INSERT INTO productos (nombre, descripcion, precio, categoria_id, disponible, imagen_url, tiempo_preparacion, stock, stock_minimo) VALUES (?,?,?,?,?,?,?,?,?)";
            PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, ApiHelper.getJson(body, "nombre"));
            pstmt.setString(2, ApiHelper.getJson(body, "descripcion"));
            pstmt.setBigDecimal(3, new BigDecimal(ApiHelper.getJson(body, "precio") != null ? ApiHelper.getJson(body, "precio") : "0"));
            pstmt.setInt(4, Integer.parseInt(ApiHelper.getJson(body, "categoriaId") != null ? ApiHelper.getJson(body, "categoriaId") : "1"));
            pstmt.setBoolean(5, !"false".equals(ApiHelper.getJson(body, "disponible")));
            pstmt.setString(6, ApiHelper.getJson(body, "imagenUrl"));
            pstmt.setInt(7, Integer.parseInt(ApiHelper.getJson(body, "tiempoPreparacion") != null ? ApiHelper.getJson(body, "tiempoPreparacion") : "0"));
            pstmt.setInt(8, Integer.parseInt(ApiHelper.getJson(body, "stock") != null ? ApiHelper.getJson(body, "stock") : "0"));
            pstmt.setInt(9, Integer.parseInt(ApiHelper.getJson(body, "stockMinimo") != null ? ApiHelper.getJson(body, "stockMinimo") : "0"));
            pstmt.executeUpdate();
            ResultSet keys = pstmt.getGeneratedKeys();
            int id = keys.next() ? keys.getInt(1) : 0;
            out.print("{\"success\":true,\"id\":" + id + ",\"message\":\"Producto creado\"}");
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al crear producto"));
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql = "UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria_id=?, disponible=?, imagen_url=?, tiempo_preparacion=?, stock=? WHERE producto_id=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, ApiHelper.getJson(body, "nombre"));
            pstmt.setString(2, ApiHelper.getJson(body, "descripcion"));
            pstmt.setBigDecimal(3, new BigDecimal(ApiHelper.getJson(body, "precio") != null ? ApiHelper.getJson(body, "precio") : "0"));
            pstmt.setInt(4, Integer.parseInt(ApiHelper.getJson(body, "categoriaId") != null ? ApiHelper.getJson(body, "categoriaId") : "1"));
            pstmt.setBoolean(5, !"false".equals(ApiHelper.getJson(body, "disponible")));
            pstmt.setString(6, ApiHelper.getJson(body, "imagenUrl"));
            pstmt.setInt(7, Integer.parseInt(ApiHelper.getJson(body, "tiempoPreparacion") != null ? ApiHelper.getJson(body, "tiempoPreparacion") : "0"));
            pstmt.setInt(8, Integer.parseInt(ApiHelper.getJson(body, "stock") != null ? ApiHelper.getJson(body, "stock") : "0"));
            pstmt.setInt(9, Integer.parseInt(ApiHelper.getJson(body, "id") != null ? ApiHelper.getJson(body, "id") : "0"));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Producto actualizado"));
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al actualizar producto"));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String id = req.getParameter("id");
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement("DELETE FROM productos WHERE producto_id=?")) {
            pstmt.setInt(1, Integer.parseInt(id));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Producto eliminado"));
        } catch (Exception e) {
            res.setStatus(500);
            out.print(ApiHelper.error("Error al eliminar producto"));
        }
    }

    private String productoToJson(ResultSet rs) throws SQLException {
        return "{" +
            "\"idProducto\":" + rs.getInt("producto_id") + "," +
            "\"nombre\":\"" + ApiHelper.esc(rs.getString("nombre")) + "\"," +
            "\"descripcion\":\"" + ApiHelper.esc(rs.getString("descripcion")) + "\"," +
            "\"precio\":" + rs.getBigDecimal("precio") + "," +
            "\"categoriaId\":" + rs.getInt("categoria_id") + "," +
            "\"categoria\":\"" + ApiHelper.esc(rs.getString("cat_nombre")) + "\"," +
            "\"disponible\":" + rs.getBoolean("disponible") + "," +
            "\"imagenUrl\":\"" + ApiHelper.esc(rs.getString("imagen_url")) + "\"," +
            "\"tiempoPreparacion\":" + rs.getInt("tiempo_preparacion") + "," +
            "\"stock\":" + rs.getInt("stock") + "," +
            "\"esPopular\":" + rs.getBoolean("es_popular") + "," +
            "\"esRecomendado\":" + rs.getBoolean("es_recomendado") +
            "}";
    }
}
