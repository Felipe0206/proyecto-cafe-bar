<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Date" %>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema Café Bar</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .login-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            overflow: hidden;
            max-width: 900px;
            width: 100%;
            display: flex;
        }

        .login-left {
            flex: 1;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
            color: white;
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .login-left h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
        }

        .login-left p {
            font-size: 1.1em;
            opacity: 0.9;
            line-height: 1.6;
        }

        .login-right {
            flex: 1;
            padding: 60px 40px;
        }

        .login-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .login-header h2 {
            color: #8B4513;
            font-size: 2em;
            margin-bottom: 10px;
        }

        .login-header p {
            color: #666;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 0.95em;
        }

        .form-group input[type="email"],
        .form-group input[type="password"],
        .form-group input[type="text"] {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #8B4513;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
        }

        .checkbox-group input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 8px;
            cursor: pointer;
        }

        .checkbox-group label {
            color: #666;
            cursor: pointer;
        }

        .btn-login {
            width: 100%;
            padding: 14px;
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }

        .btn-login:hover {
            background: #A0522D;
        }

        .alert {
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.95em;
        }

        .alert-danger {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
        }

        .alert-success {
            background: #efe;
            border: 1px solid #cfc;
            color: #3c3;
        }

        .demo-credentials {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }

        .demo-credentials h4 {
            color: #8B4513;
            margin-bottom: 15px;
            font-size: 1em;
        }

        .demo-credentials p {
            margin: 8px 0;
            font-size: 0.9em;
            color: #555;
        }

        .demo-credentials strong {
            color: #333;
        }

        .jsp-info {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 0.85em;
        }

        @media (max-width: 768px) {
            .login-container {
                flex-direction: column;
            }

            .login-left {
                padding: 40px 30px;
            }

            .login-right {
                padding: 40px 30px;
            }
        }
    </style>
</head>
<body>

    <div class="login-container">
        <!-- Sección Izquierda - Información -->
        <div class="login-left">
            <h1>☕ Café Bar</h1>
            <p>Sistema de Gestión Integral</p>
        </div>

        <!-- Sección Derecha - Formulario -->
        <div class="login-right">
            <div class="login-header">
                <h2>Iniciar Sesión</h2>
                <p>Ingrese sus credenciales para continuar</p>
            </div>

            <%-- Elemento JSP: Mostrar mensajes de error usando scriptlet --%>
            <%
                String error = (String) request.getAttribute("error");
                if (error != null && !error.isEmpty()) {
            %>
                <div class="alert alert-danger">
                    <%= error %>
                </div>
            <%
                }
            %>

            <%-- Elemento JSP: Mostrar mensajes de éxito --%>
            <%
                String mensaje = (String) session.getAttribute("mensaje");
                if (mensaje != null && !mensaje.isEmpty()) {
                    session.removeAttribute("mensaje");
            %>
                <div class="alert alert-success">
                    <%= mensaje %>
                </div>
            <%
                }
            %>

            <%-- FORMULARIO HTML CON SERVLET --%>
            <%-- Este formulario usa method="post" y action que apunta al servlet --%>
            <form action="<%= request.getContextPath() %>/login" method="post">

                <%-- Campo de Email --%>
                <div class="form-group">
                    <label for="email">Correo Electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="ejemplo@cafebar.com"
                        value="<%= request.getAttribute("email") != null ? request.getAttribute("email") : "" %>"
                        required
                        autofocus>
                </div>

                <%-- Campo de Contraseña --%>
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required>
                </div>

                <%-- Checkbox Recordar Sesión --%>
                <div class="checkbox-group">
                    <input type="checkbox" id="recordar" name="recordar" value="true">
                    <label for="recordar">Recordar mi sesión</label>
                </div>

                <%-- Botón Submit --%>
                <button type="submit" class="btn-login">
                    Iniciar Sesión
                </button>

            </form>

            <%-- Credenciales de Demostración --%>
            <div class="demo-credentials">
                <h4>Credenciales de Prueba:</h4>
                <p><strong>Administrador:</strong> admin@test.com / 123456</p>
                <p><strong>Trabajador:</strong> trabajador@test.com / 123456</p>
                <p><strong>Cliente:</strong> cliente@test.com / 123456</p>
            </div>
        </div>
    </div>


</body>
</html>
