@echo off
REM ===================================================
REM Script de Creación de Base de Datos
REM Sistema Café Bar
REM ===================================================

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   CREACION DE BASE DE DATOS - CAFE BAR        ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Verificar que exista el script SQL
if not exist "database\cafebar_schema.sql" (
    echo ✗ ERROR: No se encontró el archivo database\cafebar_schema.sql
    echo.
    pause
    exit /b 1
)

echo Este script creará la base de datos cafebar_db en MySQL.
echo.
echo IMPORTANTE: Necesitas tener MySQL Server instalado y ejecutándose.
echo.

REM Solicitar credenciales
set /p MYSQL_USER="Ingresa el usuario de MySQL (por defecto 'root'): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

echo.
echo Usuario: %MYSQL_USER%
echo.
echo Ejecutando script SQL...
echo.

REM Ejecutar script SQL
mysql -u %MYSQL_USER% -p < database\cafebar_schema.sql

if %errorlevel% neq 0 (
    echo.
    echo ✗ ERROR: No se pudo crear la base de datos
    echo.
    echo Verifica:
    echo   - MySQL Server esté ejecutándose
    echo   - La contraseña sea correcta
    echo   - Tengas permisos para crear bases de datos
    echo.
    echo Si MySQL no está en el PATH, ejecuta manualmente:
    echo mysql -u root -p ^< database\cafebar_schema.sql
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════╗
echo ║        BASE DE DATOS CREADA EXITOSAMENTE      ║
echo ╠════════════════════════════════════════════════╣
echo ║  ✓ Base de datos: cafebar_db                  ║
echo ║  ✓ Tablas creadas: 11                         ║
echo ║  ✓ Datos de prueba insertados                 ║
echo ║                                                ║
echo ║  Usuarios de prueba:                          ║
echo ║    cliente@test.com / 123456                  ║
echo ║    trabajador@test.com / 123456               ║
echo ║    admin@test.com / 123456                    ║
echo ╚════════════════════════════════════════════════╝
echo.

echo Ahora puedes:
echo   1. Configurar database.properties con tus credenciales
echo   2. Ejecutar compilar.bat
echo   3. Ejecutar ejecutar.bat
echo.

pause
