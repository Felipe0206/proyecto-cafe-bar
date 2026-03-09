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
import java.util.ArrayList;
import java.util.List;

/**
 * API REST para Pedidos del Café Bar
 * Endpoints: GET /api/pedidos, POST, PUT, DELETE
 *
 * @author Andrés Felipe Gil Gallo
 * @version 1.0
 */
@WebServlet(name = "PedidosAPIServlet", urlPatterns = {"/api/pedidos"})
public class PedidosAPIServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        super.init();
        // Crear tabla detalle_pedido si no existe
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             Statement st = conn.createStatement()) {
            st.executeUpdate(
                "CREATE TABLE IF NOT EXISTS detalle_pedido (" +
                "  detalle_id INT AUTO_INCREMENT PRIMARY KEY," +
                "  pedido_id INT NOT NULL," +
                "  producto_id INT NOT NULL," +
                "  cantidad INT NOT NULL DEFAULT 1," +
                "  precio_unitario DECIMAL(10,2) NOT NULL," +
                "  subtotal DECIMAL(10,2) NOT NULL," +
                "  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id) ON DELETE CASCADE," +
                "  FOREIGN KEY (producto_id) REFERENCES productos(producto_id)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
            System.out.println("✓ Tabla detalle_pedido lista");
        } catch (Exception e) {
            System.err.println("Error creando tabla detalle_pedido: " + e.getMessage());
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res); res.setStatus(200);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String idParam = req.getParameter("id");
        String mesaParam = req.getParameter("mesa");
        String estadoParam = req.getParameter("estado");
        String clienteParam = req.getParameter("cliente");
        String usuarioParam = req.getParameter("usuario");

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String sql;
            PreparedStatement pstmt;

            if (idParam != null) {
                sql = "SELECT * FROM pedidos WHERE pedido_id = ?";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(idParam));
            } else if (mesaParam != null) {
                sql = "SELECT * FROM pedidos WHERE mesa_id = ? ORDER BY fecha_pedido DESC";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(mesaParam));
            } else if (estadoParam != null) {
                sql = "SELECT * FROM pedidos WHERE estado = ? ORDER BY fecha_pedido DESC";
                pstmt = conn.prepareStatement(sql);
                pstmt.setString(1, estadoParam);
            } else if (clienteParam != null) {
                sql = "SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY fecha_pedido DESC";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(clienteParam));
            } else if (usuarioParam != null) {
                sql = "SELECT p.* FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.cliente_id WHERE c.usuario_id = ? ORDER BY p.fecha_pedido DESC";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, Integer.parseInt(usuarioParam));
            } else {
                sql = "SELECT * FROM pedidos ORDER BY fecha_pedido DESC";
                pstmt = conn.prepareStatement(sql);
            }

            ResultSet rs = pstmt.executeQuery();
            if (idParam != null) {
                if (rs.next()) {
                    int pedidoId = rs.getInt("pedido_id");
                    String pedidoJson = pedidoToJson(rs);
                    // Obtener items del pedido
                    String itemsJson = getItemsJson(conn, pedidoId);
                    // Insertar items en el JSON del pedido
                    String pedidoConItems = pedidoJson.substring(0, pedidoJson.length() - 1) + ",\"items\":" + itemsJson + "}";
                    out.print("{\"success\":true,\"data\":" + pedidoConItems + "}");
                } else {
                    res.setStatus(404);
                    out.print(ApiHelper.error("Pedido no encontrado"));
                }
            } else {
                StringBuilder items = new StringBuilder();
                boolean first = true; int count = 0;
                while (rs.next()) {
                    if (!first) items.append(",");
                    items.append(pedidoToJson(rs));
                    first = false; count++;
                }
                out.print("{\"success\":true,\"data\":[" + items + "],\"count\":" + count + "}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al obtener pedidos: " + e.getMessage()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String body = ApiHelper.readBody(req);

        try (Connection conn = DatabaseConnection.getInstance().getConnection()) {
            String codigoPedido = "P" + String.format("%07d", System.currentTimeMillis() % 10000000);
            String sql = "INSERT INTO pedidos (cliente_id, mesa_id, codigo_pedido, estado, total, observaciones, tipo_pedido, prioridad) VALUES (?,?,?,?,?,?,?,?)";
            PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);

            String clienteId = ApiHelper.getJson(body, "clienteId");
            if (clienteId != null && !clienteId.equals("null") && !clienteId.isEmpty()) {
                pstmt.setInt(1, Integer.parseInt(clienteId));
            } else {
                // Buscar cliente_id por usuario_id si se provee
                String usuarioId = ApiHelper.getJson(body, "idUsuario");
                if (usuarioId != null && !usuarioId.equals("null")) {
                    try (PreparedStatement buscarCliente = conn.prepareStatement(
                            "SELECT cliente_id FROM clientes WHERE usuario_id = ? LIMIT 1")) {
                        buscarCliente.setInt(1, Integer.parseInt(usuarioId));
                        ResultSet rsCliente = buscarCliente.executeQuery();
                        if (rsCliente.next()) {
                            pstmt.setInt(1, rsCliente.getInt("cliente_id"));
                        } else {
                            pstmt.setNull(1, Types.INTEGER);
                        }
                    }
                } else {
                    pstmt.setNull(1, Types.INTEGER);
                }
            }

            String idMesaStr = ApiHelper.getJson(body, "idMesa");
            pstmt.setInt(2, Integer.parseInt(idMesaStr != null ? idMesaStr : "1"));
            pstmt.setString(3, codigoPedido);
            pstmt.setString(4, "pendiente");

            String totalStr = ApiHelper.getJson(body, "total");
            pstmt.setBigDecimal(5, new BigDecimal(totalStr != null ? totalStr : "0"));
            pstmt.setString(6, ApiHelper.getJson(body, "observaciones"));
            String tipoPedido = ApiHelper.getJson(body, "tipoPedido");
            pstmt.setString(7, tipoPedido != null ? tipoPedido : "mesa");
            String prioridad = ApiHelper.getJson(body, "prioridad");
            pstmt.setString(8, prioridad != null ? prioridad : "normal");
            pstmt.executeUpdate();

            ResultSet keys = pstmt.getGeneratedKeys();
            int id = keys.next() ? keys.getInt(1) : 0;

            // Insertar items del pedido (detalle_pedido)
            List<String[]> items = parseItems(body);
            StringBuilder detalleErrors = new StringBuilder();
            for (String[] item : items) {
                try {
                    int idProducto = Integer.parseInt(item[0]);
                    int cantidad = Integer.parseInt(item[1]);
                    BigDecimal precio = new BigDecimal(item[2]);
                    BigDecimal subtotal = precio.multiply(new BigDecimal(cantidad));
                    PreparedStatement detalle = conn.prepareStatement(
                        "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)");
                    detalle.setInt(1, id);
                    detalle.setInt(2, idProducto);
                    detalle.setInt(3, cantidad);
                    detalle.setBigDecimal(4, precio);
                    detalle.setBigDecimal(5, subtotal);
                    detalle.executeUpdate();
                } catch (Exception ex) {
                    detalleErrors.append(ex.getMessage()).append("; ");
                    System.err.println("Error insertando detalle: " + ex.getMessage());
                }
            }

            // Actualizar estado de la mesa a ocupada
            if (idMesaStr != null) {
                try (PreparedStatement updateMesa = conn.prepareStatement(
                        "UPDATE mesas SET estado='ocupada' WHERE mesa_id=?")) {
                    updateMesa.setInt(1, Integer.parseInt(idMesaStr));
                    updateMesa.executeUpdate();
                }
            }

            String detalleMsg = detalleErrors.length() > 0 ? ",\"detalleError\":\"" + ApiHelper.esc(detalleErrors.toString()) + "\"" : "";
            out.print("{\"success\":true,\"id\":" + id + ",\"codigoPedido\":\"" + codigoPedido + "\",\"message\":\"Pedido creado\"" + detalleMsg + "}");
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al crear pedido: " + e.getMessage()));
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
            if (idStr == null) idStr = ApiHelper.getJson(body, "idPedido");

            String sql = "UPDATE pedidos SET estado=? WHERE pedido_id=?";
            PreparedStatement pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, estado != null ? estado : "pendiente");
            pstmt.setInt(2, Integer.parseInt(idStr != null ? idStr : "0"));
            pstmt.executeUpdate();

            // Si se entrega, liberar la mesa
            if ("entregado".equals(estado)) {
                PreparedStatement getMesa = conn.prepareStatement(
                    "SELECT mesa_id FROM pedidos WHERE pedido_id=?");
                getMesa.setInt(1, Integer.parseInt(idStr));
                ResultSet rs = getMesa.executeQuery();
                if (rs.next()) {
                    PreparedStatement liberarMesa = conn.prepareStatement(
                        "UPDATE mesas SET estado='disponible' WHERE mesa_id=?");
                    liberarMesa.setInt(1, rs.getInt("mesa_id"));
                    liberarMesa.executeUpdate();
                }
            }

            out.print(ApiHelper.ok("Pedido actualizado"));
        } catch (Exception e) {
            e.printStackTrace();
            res.setStatus(500);
            out.print(ApiHelper.error("Error al actualizar pedido: " + e.getMessage()));
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        ApiHelper.setCors(res);
        PrintWriter out = res.getWriter();
        String id = req.getParameter("id");
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement pstmt = conn.prepareStatement("DELETE FROM pedidos WHERE pedido_id=?")) {
            pstmt.setInt(1, Integer.parseInt(id));
            pstmt.executeUpdate();
            out.print(ApiHelper.ok("Pedido eliminado"));
        } catch (Exception e) {
            res.setStatus(500);
            out.print(ApiHelper.error("Error al eliminar pedido: " + e.getMessage()));
        }
    }

    private String pedidoToJson(ResultSet rs) throws SQLException {
        Timestamp fechaPedido = rs.getTimestamp("fecha_pedido");
        return "{" +
            "\"idPedido\":" + rs.getInt("pedido_id") + "," +
            "\"idMesa\":" + rs.getInt("mesa_id") + "," +
            "\"clienteId\":" + rs.getInt("cliente_id") + "," +
            "\"codigoPedido\":\"" + ApiHelper.esc(rs.getString("codigo_pedido")) + "\"," +
            "\"numeroPedido\":\"" + ApiHelper.esc(rs.getString("codigo_pedido")) + "\"," +
            "\"estado\":\"" + ApiHelper.esc(rs.getString("estado")) + "\"," +
            "\"prioridad\":\"" + ApiHelper.esc(rs.getString("prioridad")) + "\"," +
            "\"tipoPedido\":\"" + ApiHelper.esc(rs.getString("tipo_pedido")) + "\"," +
            "\"total\":" + rs.getBigDecimal("total") + "," +
            "\"observaciones\":\"" + ApiHelper.esc(rs.getString("observaciones")) + "\"," +
            "\"notas\":\"" + ApiHelper.esc(rs.getString("observaciones")) + "\"," +
            "\"fechaPedido\":\"" + (fechaPedido != null ? fechaPedido.toString() : "") + "\"" +
            "}";
    }

    private String getItemsJson(Connection conn, int pedidoId) {
        try {
            PreparedStatement ps = conn.prepareStatement(
                "SELECT dp.*, p.nombre FROM detalle_pedido dp " +
                "JOIN productos p ON dp.producto_id = p.producto_id WHERE dp.pedido_id = ?");
            ps.setInt(1, pedidoId);
            ResultSet rs = ps.executeQuery();
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            while (rs.next()) {
                if (!first) sb.append(",");
                sb.append("{")
                  .append("\"idProducto\":").append(rs.getInt("producto_id")).append(",")
                  .append("\"nombre\":\"").append(ApiHelper.esc(rs.getString("nombre"))).append("\",")
                  .append("\"cantidad\":").append(rs.getInt("cantidad")).append(",")
                  .append("\"precioUnitario\":").append(rs.getBigDecimal("precio_unitario")).append(",")
                  .append("\"subtotal\":").append(rs.getBigDecimal("subtotal"))
                  .append("}");
                first = false;
            }
            sb.append("]");
            return sb.toString();
        } catch (Exception e) {
            return "[]";
        }
    }

    /**
     * Parsea el array "items" del JSON body.
     * Retorna lista de String[]{idProducto, cantidad, precio}
     */
    private List<String[]> parseItems(String json) {
        List<String[]> result = new ArrayList<>();
        int arrStart = json.indexOf("\"items\"");
        if (arrStart < 0) return result;
        int bracketStart = json.indexOf("[", arrStart);
        if (bracketStart < 0) return result;
        int bracketEnd = json.indexOf("]", bracketStart);
        if (bracketEnd < 0) return result;
        String arr = json.substring(bracketStart + 1, bracketEnd);
        int pos = 0;
        while (pos < arr.length()) {
            int objStart = arr.indexOf("{", pos);
            if (objStart < 0) break;
            int objEnd = arr.indexOf("}", objStart);
            if (objEnd < 0) break;
            String item = arr.substring(objStart, objEnd + 1);
            String idProd = ApiHelper.getJson(item, "idProducto");
            String cant = ApiHelper.getJson(item, "cantidad");
            String precio = ApiHelper.getJson(item, "precio");
            if (idProd != null && cant != null && precio != null) {
                result.add(new String[]{idProd, cant, precio});
            }
            pos = objEnd + 1;
        }
        return result;
    }
}
