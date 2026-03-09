@echo off
REM ===================================================
REM Script de Ejecución - Sistema Café Bar
REM ===================================================

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   SISTEMA DE GESTION CAFE BAR - JDBC          ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Verificar que exista el directorio bin
if not exist "bin" (
    echo ✗ ERROR: Directorio bin no encontrado
    echo.
    echo Ejecuta primero: compilar.bat
    echo.
    pause
    exit /b 1
)

REM Verificar que exista Main.class
if not exist "bin\com\cafebar\Main.class" (
    echo ✗ ERROR: Main.class no encontrado
    echo.
    echo Ejecuta primero: compilar.bat
    echo.
    pause
    exit /b 1
)

REM Verificar driver JDBC
if not exist "lib\mysql-connector-j-9.5.0.jar" (
    echo ⚠ ADVERTENCIA: Driver JDBC no encontrado en lib/
    echo.
    echo Descarga mysql-connector-j-9.5.0.jar y colócalo en lib/
    echo.
    pause
    exit /b 1
)

REM Ejecutar el programa
echo [*] Iniciando aplicación...
echo.

java -cp "bin;lib\mysql-connector-j-9.5.0.jar" com.cafebar.Main

if %errorlevel% neq 0 (
    echo.
    echo ✗ ERROR: El programa terminó con errores
    echo.
    echo Verifica:
    echo   - La base de datos MySQL esté ejecutándose
    echo   - Las credenciales en database.properties sean correctas
    echo   - La base de datos cafebar_db exista
    echo.
)

echo.
pause
