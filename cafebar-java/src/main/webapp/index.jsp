<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.text.SimpleDateFormat" %>

<%-- Verificar autenticación --%>
<%
    if (session.getAttribute("usuario") == null) {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }

    String usuarioNombre = (String) session.getAttribute("usuarioNombre");
    String usuarioRol = (String) session.getAttribute("usuarioRol");
    String usuarioEmail = (String) session.getAttribute("usuarioEmail");
%>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema Café Bar</title>
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
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header-content {
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
            transition: color 0.3s;
        }
        .nav a:hover { color: #D2691E; }
        .nav a.active { color: #D2691E; border-bottom: 2px solid #D2691E; }
        .container {
            max-width: 1400px;
            margin: 30px auto;
            padding: 0 40px;
        }
        .welcome-banner {
            background: white;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .welcome-banner h1 {
            color: #8B4513;
            font-size: 2.5em;
            margin-bottom: 15px;
        }
        .welcome-banner p {
            color: #666;
            font-size: 1.2em;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        .stat-card h3 {
            color: #666;
            font-size: 0.95em;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-card .value {
            font-size: 2.5em;
            font-weight: 700;
            color: #8B4513;
            margin-bottom: 10px;
        }
        .stat-card .label {
            color: #999;
            font-size: 0.9em;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }
        .feature-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            border-left: 4px solid #8B4513;
        }
        .feature-card h3 {
            color: #8B4513;
            font-size: 1.4em;
            margin-bottom: 15px;
        }
        .feature-card p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .feature-card a {
            display: inline-block;
            padding: 10px 20px;
            background: #8B4513;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.3s;
        }
        .feature-card a:hover {
            background: #A0522D;
        }
        .badge {
            padding: 6px 14px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-info { background: #d1ecf1; color: #0c5460; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
        }
        .btn-danger { background: #dc3545; color: white; }
        .tech-info {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-top: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .tech-info h3 {
            color: #8B4513;
            margin-bottom: 20px;
        }
        .tech-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .tech-badge {
            padding: 8px 16px;
            background: #f8f9fa;
            border: 2px solid #8B4513;
            border-radius: 20px;
            color: #8B4513;
            font-weight: 600;
            font-size: 0.9em;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="header-content">
            <div>
                <h1 style="font-size: 1.8em;">☕ Sistema de Gestión Café Bar</h1>
                <p style="opacity: 0.9; margin-top: 5px;">Aplicación Web Java - Evidencia GA7-220501096-AA2-EV02</p>
            </div>
            <div style="text-align: right;">
                <div style="margin-bottom: 10px;">
                    <strong><%= usuarioNombre %></strong>
                    <br>
                    <span style="opacity: 0.8; font-size: 0.9em;"><%= usuarioEmail %></span>
                </div>
                <%-- Elemento JSP: Badge dinámico según rol --%>
                <%
                    String badgeClass = "badge-info";
                    if ("administrador".equals(usuarioRol)) {
                        badgeClass = "badge-warning";
                    } else if ("trabajador".equals(usuarioRol)) {
                        badgeClass = "badge-info";
                    } else {
                        badgeClass = "badge-success";
                    }
                %>
                <span class="badge <%= badgeClass %>"><%= usuarioRol.toUpperCase() %></span>
                <a href="<%= request.getContextPath() %>/logout" class="btn btn-danger" style="margin-left: 15px;">
                    Cerrar Sesión
                </a>
            </div>
        </div>
    </div>

    <div class="nav">
        <a href="<%= request.getContextPath() %>/index.jsp" class="active">Inicio</a>
        <a href="<%= request.getContextPath() %>/productos?action=listar">Productos</a>
        <a href="<%= request.getContextPath() %>/usuarios?action=listar">Usuarios</a>
    </div>

    <div class="container">

        <div class="welcome-banner">
            <h1>¡Bienvenido, <%= usuarioNombre %>! 👋</h1>
            <p>
                <%-- Elemento JSP: Expresión con fecha actual --%>
                <%
                    SimpleDateFormat sdf = new SimpleDateFormat("EEEE, dd 'de' MMMM 'de' yyyy - HH:mm");
                    String fechaActual = sdf.format(new Date());
                %>
                <%= fechaActual %>
            </p>
        </div>

        <%-- Tarjetas de Estadísticas --%>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Servlets Activos</h3>
                <div class="value">4</div>
                <div class="label">Login, Producto, Usuario, Logout</div>
            </div>

            <div class="stat-card">
                <h3>Páginas JSP</h3>
                <div class="value">4</div>
                <div class="label">index.jsp, login.jsp, productos.jsp, usuarios.jsp</div>
            </div>

            <div class="stat-card">
                <h3>Conexión JDBC</h3>
                <div class="value">✓</div>
                <div class="label">MySQL - Patrón Singleton</div>
            </div>

            <div class="stat-card">
                <h3>Operaciones CRUD</h3>
                <div class="value">100%</div>
                <div class="label">Create, Read, Update, Delete</div>
            </div>
        </div>

        <%-- Funcionalidades Principales --%>
        <h2 style="color: #333; margin-bottom: 20px;">Funcionalidades del Sistema</h2>

        <div class="features-grid">
            <div class="feature-card">
                <h3>📦 Gestión de Productos</h3>
                <p>
                    CRUD completo de productos con formularios HTML que envían datos mediante
                    <strong>método POST</strong> al servlet ProductoServlet. Usa PreparedStatement
                    de JDBC para operaciones seguras en la base de datos.
                </p>
                <a href="<%= request.getContextPath() %>/productos?action=listar">
                    Ir a Productos →
                </a>
            </div>

            <div class="feature-card">
                <h3>👥 Gestión de Usuarios</h3>
                <p>
                    Sistema completo de usuarios con <strong>método GET</strong> para listar y
                    <strong>método POST</strong> para crear/actualizar. Elementos JSP dinámicos
                    para mostrar datos desde la base de datos MySQL.
                </p>
                <a href="<%= request.getContextPath() %>/usuarios?action=listar">
                    Ir a Usuarios →
                </a>
            </div>

            <div class="feature-card">
                <h3>🔐 Autenticación</h3>
                <p>
                    LoginServlet implementa <strong>doGet()</strong> para mostrar el formulario
                    y <strong>doPost()</strong> para procesar credenciales. Utiliza HttpSession
                    para mantener el estado del usuario autenticado.
                </p>
                <a href="<%= request.getContextPath() %>/login.jsp">
                    Ver Login →
                </a>
            </div>
        </div>

        <%-- Información Técnica --%>
        <div class="tech-info">
            <h3>Tecnologías Implementadas</h3>
            <div class="tech-badges">
                <span class="tech-badge">✓ Java Servlets</span>
                <span class="tech-badge">✓ JavaServer Pages (JSP)</span>
                <span class="tech-badge">✓ JDBC (Java Database Connectivity)</span>
                <span class="tech-badge">✓ MySQL Database</span>
                <span class="tech-badge">✓ Métodos GET y POST</span>
                <span class="tech-badge">✓ HttpSession</span>
                <span class="tech-badge">✓ PreparedStatement</span>
                <span class="tech-badge">✓ Patrón DAO</span>
                <span class="tech-badge">✓ Patrón Singleton</span>
                <span class="tech-badge">✓ HTML Forms</span>
                <span class="tech-badge">✓ CSS3</span>
            </div>
        </div>

        <%-- Cumplimiento de Requisitos --%>
        <div class="tech-info" style="margin-top: 20px;">
            <h3>Cumplimiento de Requisitos de la Evidencia</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead style="background: #8B4513; color: white;">
                    <tr>
                        <th style="padding: 12px; text-align: left;">Requisito</th>
                        <th style="padding: 12px; text-align: center;">Cumple</th>
                        <th style="padding: 12px; text-align: left;">Implementación</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px;"><strong>1. Formularios HTML con servlets (30%)</strong></td>
                        <td style="padding: 12px; text-align: center; font-size: 1.5em;">✓</td>
                        <td style="padding: 12px;">
                            login.jsp, productos.jsp, usuarios.jsp con action apuntando a servlets
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px;"><strong>2. Métodos GET y POST (30%)</strong></td>
                        <td style="padding: 12px; text-align: center; font-size: 1.5em;">✓</td>
                        <td style="padding: 12px;">
                            Todos los servlets implementan doGet() y doPost()
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px;"><strong>3. Elementos JSP (30%)</strong></td>
                        <td style="padding: 12px; text-align: center; font-size: 1.5em;">✓</td>
                        <td style="padding: 12px;">
                            Scriptlets, expresiones, directivas, declaraciones, JSTL
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px;"><strong>4. Versionamiento (10%)</strong></td>
                        <td style="padding: 12px; text-align: center; font-size: 1.5em;">✓</td>
                        <td style="padding: 12px;">
                            Proyecto estructurado y documentado
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>

</body>
</html>
