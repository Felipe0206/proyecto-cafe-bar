<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.cafebar.models.Producto" %>
<%@ page import="java.text.NumberFormat" %>
<%@ page import="java.util.Locale" %>

<%-- Directiva JSP: Define que esta página requiere sesión --%>
<%@ page session="true" %>

<%-- Scriptlet JSP: Verificar autenticación --%>
<%
    if (session.getAttribute("usuario") == null) {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }
    String usuarioNombre = (String) session.getAttribute("usuarioNombre");
    String usuarioRol = (String) session.getAttribute("usuarioRol");
%>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Productos - Café Bar</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
        }

        .header {
            background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
            color: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 { font-size: 1.8em; }

        .user-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .nav {
            background: white;
            padding: 15px 40px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .nav a {
            color: #8B4513;
            text-decoration: none;
            margin-right: 25px;
            font-weight: 500;
            transition: color 0.3s;
        }

        .nav a:hover { color: #D2691E; }
        .nav a.active { color: #D2691E; border-bottom: 2px solid #D2691E; }

        .container {
            max-width: 1400px;
            margin: 30px auto;
            padding: 0 40px;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .page-header h2 {
            color: #333;
            font-size: 2em;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: 600;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background: #8B4513;
            color: white;
        }

        .btn-primary:hover { background: #A0522D; }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-danger {
            background: #dc3545;
            color: white;
        }

        .btn-warning {
            background: #ffc107;
            color: #333;
        }

        .btn-small {
            padding: 6px 12px;
            font-size: 0.9em;
        }

        .alert {
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .alert-success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }

        .alert-danger {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }

        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            padding: 30px;
            margin-bottom: 30px;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 1em;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #8B4513;
        }

        .table-container {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        table thead {
            background: #8B4513;
            color: white;
        }

        table th,
        table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }

        table tbody tr:hover {
            background: #f8f9fa;
        }

        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }

        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-warning { background: #fff3cd; color: #856404; }

        .actions {
            display: flex;
            gap: 8px;
        }
    </style>
</head>
<body>

    <%-- Header con información de sesión usando elementos JSP --%>
    <div class="header">
        <h1>☕ Sistema Café Bar</h1>
        <div class="user-info">
            <%-- Expresión JSP para mostrar nombre de usuario --%>
            <span>Bienvenido, <strong><%= usuarioNombre %></strong></span>
            <span class="badge badge-success"><%= usuarioRol %></span>
            <a href="<%= request.getContextPath() %>/logout" class="btn btn-small btn-danger">Cerrar Sesión</a>
        </div>
    </div>

    <%-- Navegación --%>
    <div class="nav">
        <a href="<%= request.getContextPath() %>/index.jsp">Inicio</a>
        <a href="<%= request.getContextPath() %>/productos?action=listar" class="active">Productos</a>
        <a href="<%= request.getContextPath() %>/usuarios?action=listar">Usuarios</a>
    </div>

    <div class="container">

        <%-- Declaración JSP: Variable para formatear moneda --%>
        <%!
            private String formatearPrecio(java.math.BigDecimal precio) {
                if (precio == null) return "$0.00";
                NumberFormat formato = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
                return formato.format(precio);
            }
        %>

        <%-- Scriptlet JSP: Obtener lista de productos del request --%>
        <%
            List<Producto> productos = (List<Producto>) request.getAttribute("productos");
            Boolean modoEdicion = (Boolean) request.getAttribute("modoEdicion");
            Producto productoEditar = (Producto) request.getAttribute("producto");
            String mensaje = (String) session.getAttribute("mensaje");
            String error = (String) request.getAttribute("error");

            if (modoEdicion == null) modoEdicion = false;
        %>

        <%-- Elemento JSP: Condicional para mostrar mensajes --%>
        <% if (mensaje != null) {
            session.removeAttribute("mensaje");
        %>
            <div class="alert alert-success"><%= mensaje %></div>
        <% } %>

        <% if (error != null) { %>
            <div class="alert alert-danger"><%= error %></div>
        <% } %>

        <div class="page-header">
            <h2>Gestión de Productos</h2>
            <% if (!modoEdicion && productos != null) { %>
                <div>
                    <span style="color: #666; margin-right: 20px;">
                        Total: <strong><%= productos.size() %></strong> productos
                    </span>
                </div>
            <% } %>
        </div>

        <%-- FORMULARIO PARA CREAR/EDITAR PRODUCTO --%>
        <%-- Este formulario se envía al servlet usando POST --%>
        <div class="card">
            <h3><%= modoEdicion ? "Editar Producto" : "Nuevo Producto" %></h3>
            <hr style="margin: 20px 0; border: none; border-top: 2px solid #eee;">

            <form action="<%= request.getContextPath() %>/productos" method="post">

                <%-- Campo hidden para acción y ID --%>
                <input type="hidden" name="action"
                       value="<%= modoEdicion ? "actualizar" : "crear" %>">

                <% if (modoEdicion && productoEditar != null) { %>
                    <input type="hidden" name="id"
                           value="<%= productoEditar.getIdProducto() %>">
                <% } %>

                <div class="form-grid">
                    <%-- Campo Nombre --%>
                    <div class="form-group">
                        <label for="nombre">Nombre del Producto *</label>
                        <input type="text" id="nombre" name="nombre"
                               value="<%= modoEdicion && productoEditar != null ?
                                       productoEditar.getNombre() : "" %>"
                               required>
                    </div>

                    <%-- Campo Precio --%>
                    <div class="form-group">
                        <label for="precio">Precio *</label>
                        <input type="number" id="precio" name="precio"
                               step="0.01" min="0"
                               value="<%= modoEdicion && productoEditar != null ?
                                       productoEditar.getPrecio() : "" %>"
                               required>
                    </div>

                    <%-- Campo Costo --%>
                    <div class="form-group">
                        <label for="costo">Costo</label>
                        <input type="number" id="costo" name="costo"
                               step="0.01" min="0"
                               value="<%= modoEdicion && productoEditar != null ?
                                       productoEditar.getCosto() : "" %>">
                    </div>

                    <%-- Campo Stock --%>
                    <div class="form-group">
                        <label for="stock">Stock Actual</label>
                        <input type="number" id="stock" name="stock" min="0"
                               value="<%= modoEdicion && productoEditar != null ?
                                       productoEditar.getStock() : "0" %>">
                    </div>

                    <%-- Campo Stock Mínimo --%>
                    <div class="form-group">
                        <label for="stockMinimo">Stock Mínimo</label>
                        <input type="number" id="stockMinimo" name="stockMinimo" min="0"
                               value="<%= modoEdicion && productoEditar != null ?
                                       productoEditar.getStockMinimo() : "10" %>">
                    </div>

                    <%-- Select de Categoría --%>
                    <div class="form-group">
                        <label for="categoriaId">Categoría</label>
                        <select id="categoriaId" name="categoriaId">
                            <option value="1" <%= modoEdicion && productoEditar != null &&
                                    productoEditar.getCategoriaId() == 1 ? "selected" : "" %>>
                                Bebidas
                            </option>
                            <option value="2" <%= modoEdicion && productoEditar != null &&
                                    productoEditar.getCategoriaId() == 2 ? "selected" : "" %>>
                                Comidas
                            </option>
                            <option value="3" <%= modoEdicion && productoEditar != null &&
                                    productoEditar.getCategoriaId() == 3 ? "selected" : "" %>>
                                Postres
                            </option>
                            <option value="4" <%= modoEdicion && productoEditar != null &&
                                    productoEditar.getCategoriaId() == 4 ? "selected" : "" %>>
                                Especiales
                            </option>
                        </select>
                    </div>
                </div>

                <%-- Campo Descripción --%>
                <div class="form-group">
                    <label for="descripcion">Descripción</label>
                    <textarea id="descripcion" name="descripcion" rows="3"><%=
                        modoEdicion && productoEditar != null ?
                        productoEditar.getDescripcion() : ""
                    %></textarea>
                </div>

                <%-- Checkbox Disponible --%>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="disponible" value="true"
                               <%= modoEdicion && productoEditar != null &&
                                   productoEditar.isDisponible() ? "checked" :
                                   (!modoEdicion ? "checked" : "") %>>
                        Producto Disponible
                    </label>
                </div>

                <%-- Botones --%>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">
                        <%= modoEdicion ? "Actualizar Producto" : "Crear Producto" %>
                    </button>
                    <% if (modoEdicion) { %>
                        <a href="<%= request.getContextPath() %>/productos?action=listar"
                           class="btn btn-warning">
                            Cancelar
                        </a>
                    <% } %>
                </div>
            </form>
        </div>

        <%-- TABLA DE PRODUCTOS (solo si no estamos en modo edición) --%>
        <% if (!modoEdicion && productos != null) { %>
        <div class="card">
            <h3>Lista de Productos</h3>
            <hr style="margin: 20px 0; border: none; border-top: 2px solid #eee;">

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Precio</th>
                            <th>Costo</th>
                            <th>Stock</th>
                            <th>Stock Mín.</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <%-- Elemento JSP: Bucle for para iterar productos --%>
                        <% for (Producto p : productos) { %>
                        <tr>
                            <td><%= p.getIdProducto() %></td>
                            <td><strong><%= p.getNombre() %></strong></td>
                            <td><%= p.getDescripcion() != null ? p.getDescripcion() : "-" %></td>
                            <td><%= formatearPrecio(p.getPrecio()) %></td>
                            <td><%= formatearPrecio(p.getCosto()) %></td>
                            <td>
                                <%-- Elemento JSP: Condicional para stock --%>
                                <% if (p.getStock() <= p.getStockMinimo()) { %>
                                    <span class="badge badge-danger"><%= p.getStock() %></span>
                                <% } else { %>
                                    <span class="badge badge-success"><%= p.getStock() %></span>
                                <% } %>
                            </td>
                            <td><%= p.getStockMinimo() %></td>
                            <td>
                                <% if (p.isDisponible()) { %>
                                    <span class="badge badge-success">Disponible</span>
                                <% } else { %>
                                    <span class="badge badge-danger">No disponible</span>
                                <% } %>
                            </td>
                            <td>
                                <div class="actions">
                                    <a href="<%= request.getContextPath() %>/productos?action=editar&id=<%= p.getIdProducto() %>"
                                       class="btn btn-small btn-warning">
                                        Editar
                                    </a>
                                    <a href="<%= request.getContextPath() %>/productos?action=eliminar&id=<%= p.getIdProducto() %>"
                                       class="btn btn-small btn-danger"
                                       onclick="return confirm('¿Eliminar este producto?')">
                                        Eliminar
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <% } %>

                        <%-- Mensaje si no hay productos --%>
                        <% if (productos.isEmpty()) { %>
                        <tr>
                            <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
                                No hay productos registrados. Cree el primero usando el formulario arriba.
                            </td>
                        </tr>
                        <% } %>
                    </tbody>
                </table>
            </div>
        </div>
        <% } %>

    </div>

</body>
</html>
