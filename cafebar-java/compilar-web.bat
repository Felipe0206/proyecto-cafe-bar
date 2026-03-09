@echo off
echo ========================================
echo COMPILACION APLICACION WEB CAFE BAR
echo Evidencia: GA7-220501096-AA2-EV02
echo ========================================
echo.

REM Limpiar compilaciones anteriores
echo [1/4] Limpiando compilaciones anteriores...
if exist "build\classes" rmdir /S /Q "build\classes"
if exist "build\cafebar.war" del /Q "build\cafebar.war"
mkdir build\classes 2>nul

REM Compilar clases Java
echo.
echo [2/4] Compilando clases Java (Models, DAOs, Servlets)...
REM Configurar CATALINA_HOME si no esta definido
if "%CATALINA_HOME%"=="" (
    set CATALINA_HOME=c:\Users\USER\Desktop\cafebar-sean\apache-tomcat-9.0.95
)

javac -d build/classes ^
    -cp "lib/mysql-connector-j-9.5.0/mysql-connector-j-9.5.0/mysql-connector-j-9.5.0.jar;%CATALINA_HOME%\lib\servlet-api.jar" ^
    src/main/java/com/cafebar/models/*.java ^
    src/main/java/com/cafebar/config/*.java ^
    src/main/java/com/cafebar/dao/*.java ^
    src/main/java/com/cafebar/servlets/*.java

if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la compilacion. Verifique los errores arriba.
    echo.
    echo NOTA: Si falta servlet-api.jar, configure CATALINA_HOME o descargue:
    echo https://repo1.maven.org/maven2/javax/servlet/javax.servlet-api/4.0.1/javax.servlet-api-4.0.1.jar
    pause
    exit /b 1
)

echo [OK] Compilacion exitosa

REM Crear estructura WAR
echo.
echo [3/4] Creando estructura WAR...
mkdir build\war 2>nul
mkdir build\war\WEB-INF 2>nul
mkdir build\war\WEB-INF\classes 2>nul
mkdir build\war\WEB-INF\lib 2>nul

REM Copiar archivos compilados
xcopy /E /I /Y build\classes\* build\war\WEB-INF\classes\

REM Copiar web.xml
copy src\main\webapp\WEB-INF\web.xml build\war\WEB-INF\

REM Copiar JSPs
copy src\main\webapp\*.jsp build\war\

REM Copiar librerías
copy lib\mysql-connector-j-9.5.0\mysql-connector-j-9.5.0\mysql-connector-j-9.5.0.jar build\war\WEB-INF\lib\

REM Crear archivo WAR
echo.
echo [4/4] Empaquetando archivo WAR...
cd build\war
jar -cvf ..\cafebar.war *
cd ..\..

echo.
echo ========================================
echo COMPILACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo Archivo generado: build\cafebar.war
echo.
echo Para desplegar en Tomcat:
echo 1. Copie build\cafebar.war a %CATALINA_HOME%\webapps\
echo 2. Inicie Tomcat
echo 3. Acceda a: http://localhost:8080/cafebar/
echo.
echo Para desplegar automaticamente ejecute: desplegar-tomcat.bat
echo.
pause
