@echo off
cls
echo ========================================
echo SISTEMA CAFE BAR - APLICACION WEB
echo Evidencia: GA7-220501096-AA2-EV02
echo ========================================
echo.

set CATALINA_HOME=c:\Users\USER\Desktop\cafebar-sean\apache-tomcat-9.0.95
set JAVA_HOME=C:\Program Files\Java\jdk-21

echo [1/3] Verificando instalacion de Tomcat...
if not exist "%CATALINA_HOME%\bin\startup.bat" (
    echo [ERROR] No se encuentra Tomcat en: %CATALINA_HOME%
    pause
    exit /b 1
)
echo [OK] Tomcat encontrado

echo.
echo [2/3] Verificando aplicacion WAR...
if not exist "%CATALINA_HOME%\webapps\cafebar.war" (
    echo [ERROR] No se encuentra cafebar.war en webapps
    echo Ejecute compilar-web.bat primero
    pause
    exit /b 1
)
echo [OK] cafebar.war encontrado

echo.
echo [3/3] Iniciando Apache Tomcat...
echo.
echo Por favor espere mientras Tomcat se inicia...
echo Esto puede tardar 10-30 segundos...
echo.

start "Apache Tomcat" /MIN cmd /c "%CATALINA_HOME%\bin\startup.bat"

timeout /t 5 /nobreak > nul

echo ========================================
echo TOMCAT INICIADO
echo ========================================
echo.
echo La aplicacion estara disponible en aproximadamente 20 segundos en:
echo.
echo   http://localhost:8080/cafebar/
echo.
echo Credenciales de prueba:
echo   - admin@test.com / 123456 (Administrador)
echo   - trabajador@test.com / 123456 (Trabajador)
echo   - cliente@test.com / 123456 (Cliente)
echo.
echo NOTA IMPORTANTE:
echo   La aplicacion esta configurada para usar: cafe_bar_db
echo   (La base de datos ya existe en su sistema)
echo.
echo Para detener Tomcat ejecute: DETENER_APLICACION.bat
echo.
pause
