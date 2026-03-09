<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.cafebar.models.Usuario" %>
<%@ page import="java.text.SimpleDateFormat" %>

<%
    if (session.getAttribute("usuario") == null) {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }
    String usuarioNombre = (String) session.getAttribute("usuarioNombre");
    String usuarioRol = (String) session.getAttribute("usuarioRol");

    List<Usuario> usuarios = (List<Usuario>) request.getAttribute("usuarios");
    Usuario usuarioEditar = (Usuario) request.getAttribute("usuario");
    Boolean modoEdicion = (Boolean) request.getAttribute("modoEdicion");
    if (modoEdicion == null) modoEdicion = false;
%>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Usuarios - Café Bar</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/css/styles.css">
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
        }
        .nav a.active { color: #D2691E; border-bottom: 2px solid #D2691E; }
        .container { max-width: 1400px; margin: 30px auto; padding: 0 40px; }
        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            padding: 30px;
            margin-bottom: 30px;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
        }
        .btn-primary { background: #8B4513; color: white; }
        .btn-warning { background: #ffc107; color: #333; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-small { padding: 6px 12px; font-size: 0.9em; }
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 1em;
        }
        table { width: 100%; border-collapse: collapse; }
        table thead { background: #8B4513; color: white; }
        table th, table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
        table tbody tr:hover { background: #f8f9fa; }
        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-info { background: #d1ecf1; color: #0c5460; }
        .alert-success {
            background: #d4edda;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #155724;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>☕ Sistema Café Bar</h1>
        <div>
            <span>Bienvenido, <strong><%= usuarioNombre %></strong></span>
            <span class="badge badge-success"><%= usuarioRol %></span>
            <a href="<%= request.getContextPath() %>/logout" class="btn btn-small btn-danger">Cerrar Sesión</a>
        </div>
    </div>

    <div class="nav">
        <a href="<%= request.getContextPath() %>/index.jsp">Inicio</a>
        <a href="<%= request.getContextPath() %>/productos?action=listar">Productos</a>
        <a href="<%= request.getContextPath() %>/usuarios?action=listar" class="active">Usuarios</a>
    </div>

    <div class="container">

        <%-- Mensaje de éxito --%>
        <%
            String mensaje = (String) session.getAttribute("mensaje");
            if (mensaje != null) {
                session.removeAttribute("mensaje");
        %>
            <div class="alert-success"><%= mensaje %></div>
        <% } %>

        <h2>Gestión de Usuarios</h2>
        <hr style="margin: 20px 0; border: none; border-top: 2px solid #eee;">

        <%-- FORMULARIO CRUD DE USUARIOS --%>
        <div class="card">
            <h3><%= modoEdicion ? "Editar Usuario" : "Nuevo Usuario" %></h3>

            <form action="<%= request.getContextPath() %>/usuarios" method="post">
                <input type="hidden" name="action" value="<%= modoEdicion ? "actualizar" : "crear" %>">
                <% if (modoEdicion && usuarioEditar != null) { %>
                    <input type="hidden" name="id" value="<%= usuarioEditar.getIdUsuario() %>">
                <% } %>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" name="nombre"
                               value="<%= modoEdicion && usuarioEditar != null ? usuarioEditar.getNombre() : "" %>"
                               required>
                    </div>

                    <div class="form-group">
                        <label>Apellido</label>
                        <input type="text" name="apellido"
                               value="<%= modoEdicion && usuarioEditar != null ? usuarioEditar.getApellido() : "" %>">
                    </div>

                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email"
                               value="<%= modoEdicion && usuarioEditar != null ? usuarioEditar.getEmail() : "" %>"
                               required>
                    </div>

                    <% if (!modoEdicion) { %>
                    <div class="form-group">
                        <label>Contraseña *</label>
                        <input type="password" name="password" required>
                    </div>
                    <% } %>

                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="text" name="telefono"
                               value="<%= modoEdicion && usuarioEditar != null ? usuarioEditar.getTelefono() : "" %>">
                    </div>

                    <div class="form-group">
                        <label>Rol</label>
                        <select name="rol">
                            <option value="cliente" <%= modoEdicion && usuarioEditar != null &&
                                    "cliente".equals(usuarioEditar.getRol()) ? "selected" : "" %>>
                                Cliente
                            </option>
                            <option value="trabajador" <%= modoEdicion && usuarioEditar != null &&
                                    "trabajador".equals(usuarioEditar.getRol()) ? "selected" : "" %>>
                                Trabajador
                            </option>
                            <option value="administrador" <%= modoEdicion && usuarioEditar != null &&
                                    "administrador".equals(usuarioEditar.getRol()) ? "selected" : "" %>>
                                Administrador
                            </option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" name="activo" value="true"
                               <%= modoEdicion && usuarioEditar != null && usuarioEditar.isActivo() ?
                                   "checked" : (!modoEdicion ? "checked" : "") %>>
                        Usuario Activo
                    </label>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button type="submit" class="btn btn-primary">
                        <%= modoEdicion ? "Actualizar" : "Crear Usuario" %>
                    </button>
                    <% if (modoEdicion) { %>
                        <a href="<%= request.getContextPath() %>/usuarios?action=listar" class="btn btn-warning">
                            Cancelar
                        </a>
                    <% } %>
                </div>
            </form>
        </div>

        <%-- TABLA DE USUARIOS --%>
        <% if (!modoEdicion && usuarios != null) { %>
        <div class="card">
            <h3>Lista de Usuarios (<%= usuarios.size() %>)</h3>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <%-- Elemento JSP: Bucle para iterar usuarios --%>
                    <% for (Usuario u : usuarios) {
                        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
                    %>
                    <tr>
                        <td><%= u.getIdUsuario() %></td>
                        <td><strong><%= u.getNombre() %> <%= u.getApellido() != null ? u.getApellido() : "" %></strong></td>
                        <td><%= u.getEmail() %></td>
                        <td><%= u.getTelefono() != null ? u.getTelefono() : "-" %></td>
                        <td>
                            <%-- Elemento JSP: Condicional múltiple para roles --%>
                            <% if ("administrador".equals(u.getRol())) { %>
                                <span class="badge badge-danger">Administrador</span>
                            <% } else if ("trabajador".equals(u.getRol())) { %>
                                <span class="badge badge-info">Trabajador</span>
                            <% } else { %>
                                <span class="badge badge-success">Cliente</span>
                            <% } %>
                        </td>
                        <td>
                            <% if (u.isActivo()) { %>
                                <span class="badge badge-success">Activo</span>
                            <% } else { %>
                                <span class="badge badge-danger">Inactivo</span>
                            <% } %>
                        </td>
                        <td>
                            <%= u.getUltimoAcceso() != null ? sdf.format(u.getUltimoAcceso()) : "Nunca" %>
                        </td>
                        <td>
                            <a href="<%= request.getContextPath() %>/usuarios?action=editar&id=<%= u.getIdUsuario() %>"
                               class="btn btn-small btn-warning">Editar</a>
                            <a href="<%= request.getContextPath() %>/usuarios?action=eliminar&id=<%= u.getIdUsuario() %>"
                               class="btn btn-small btn-danger"
                               onclick="return confirm('¿Eliminar este usuario?')">Eliminar</a>
                        </td>
                    </tr>
                    <% } %>

                    <% if (usuarios.isEmpty()) { %>
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                            No hay usuarios registrados.
                        </td>
                    </tr>
                    <% } %>
                </tbody>
            </table>
        </div>
        <% } %>

    </div>

</body>
</html>
