# 🚀 CÓMO EJECUTAR EL PROYECTO

## ⚠️ IDENTIFICAR QUÉ TERMINAL ESTÁS USANDO

### Si ves esto en tu terminal:
```
PS C:\Users\USER>
```
**Estás en PowerShell** → Usa las instrucciones de PowerShell

### Si ves esto:
```
C:\Users\USER>
```
**Estás en CMD** → Usa las instrucciones de CMD

---

## 📋 OPCIÓN 1: PowerShell (Recomendado para Windows 10/11)

### Paso 1: Abrir PowerShell
- Presiona `Windows + X`
- Selecciona "Windows PowerShell" o "Terminal"

### Paso 2: Ir a la carpeta del proyecto
```powershell
cd C:\Users\USER\Desktop\cafebar-sean\cafebar-java
```

### Paso 3: Ver archivos disponibles
```powershell
dir
```

### Paso 4: Compilar (solo la primera vez)
```powershell
.\compilar.ps1
```

**Si te sale error de permisos:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\compilar.ps1
```

### Paso 5: Ejecutar el programa
```powershell
.\ejecutar.ps1
```

---

## 📋 OPCIÓN 2: CMD (Símbolo del sistema)

### Paso 1: Abrir CMD
- Presiona `Windows + R`
- Escribe: `cmd`
- Presiona Enter

### Paso 2: Ir a la carpeta del proyecto
```cmd
cd C:\Users\USER\Desktop\cafebar-sean\cafebar-java
```

### Paso 3: Ver archivos disponibles
```cmd
dir
```

### Paso 4: Compilar (solo la primera vez)
```cmd
compilar.bat
```

### Paso 5: Ejecutar el programa
```cmd
ejecutar.bat
```

---

## 📋 OPCIÓN 3: Comandos Java Directos (Cualquier terminal)

### En PowerShell:

**Compilar:**
```powershell
javac -d bin -cp ".;lib\mysql-connector-java-8.0.33.jar" `
  src\main\java\com\cafebar\config\*.java `
  src\main\java\com\cafebar\models\*.java `
  src\main\java\com\cafebar\dao\*.java `
  src\main\java\com\cafebar\Main.java

Copy-Item src\main\resources\* bin\ -Recurse -Force
```

**Ejecutar:**
```powershell
java -cp "bin;lib\mysql-connector-java-8.0.33.jar" com.cafebar.Main
```

### En CMD:

**Compilar:**
```cmd
javac -d bin -cp ".;lib\mysql-connector-java-8.0.33.jar" ^
  src\main\java\com\cafebar\config\*.java ^
  src\main\java\com\cafebar\models\*.java ^
  src\main\java\com\cafebar\dao\*.java ^
  src\main\java\com\cafebar\Main.java

xcopy src\main\resources\*.* bin\ /S /Y
```

**Ejecutar:**
```cmd
java -cp "bin;lib\mysql-connector-java-8.0.33.jar" com.cafebar.Main
```

---

## 📋 OPCIÓN 4: Desde el Explorador de Archivos (Más fácil)

### Para PowerShell:
1. Abre la carpeta: `C:\Users\USER\Desktop\cafebar-sean\cafebar-java`
2. **Haz clic derecho** en `compilar.ps1`
3. Selecciona "Ejecutar con PowerShell"
4. Espera a que termine
5. **Haz clic derecho** en `ejecutar.ps1`
6. Selecciona "Ejecutar con PowerShell"

### Para CMD:
1. Abre la carpeta: `C:\Users\USER\Desktop\cafebar-sean\cafebar-java`
2. **Doble clic** en `compilar.bat`
3. Espera a que termine
4. **Doble clic** en `ejecutar.bat`

---

## ✅ ARCHIVOS DISPONIBLES

Ahora tienes **DOS versiones** de cada script:

**Para PowerShell (.ps1):**
- `compilar.ps1` ✓ Creado
- `ejecutar.ps1` ✓ Creado

**Para CMD (.bat):**
- `compilar.bat` ✓ Creado
- `ejecutar.bat` ✓ Creado

**Usa el que corresponda a tu terminal.**

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "No se puede cargar el archivo porque la ejecución de scripts está deshabilitada"

**Solución:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Luego ejecuta de nuevo el script.

---

### Error: "El término '.bat' no se reconoce"

**Causa:** Estás en PowerShell pero intentando ejecutar archivos .bat

**Solución 1 (Recomendada):**
```powershell
.\compilar.ps1
.\ejecutar.ps1
```

**Solución 2:**
Cambia a CMD:
- Escribe: `cmd`
- Luego: `compilar.bat`

---

### Error: "javac no se reconoce como comando"

**Causa:** Java no está en el PATH

**Solución:**
1. Verifica que Java esté instalado:
   ```powershell
   java -version
   ```

2. Si no está instalado, descarga JDK desde:
   https://www.oracle.com/java/technologies/downloads/

3. Agrega Java al PATH o usa la ruta completa:
   ```powershell
   "C:\Program Files\Java\jdk-XX\bin\javac" -version
   ```

---

### Error: "No se encontró el driver JDBC"

**Solución:**
1. Descarga el driver desde: https://dev.mysql.com/downloads/connector/j/
2. Extrae el archivo `mysql-connector-java-8.0.33.jar`
3. Copia a: `cafebar-java\lib\`

---

### Error: "Access denied for user 'root'@'localhost'"

**Solución:**
1. Edita: `src\main\resources\database.properties`
2. Cambia la línea:
   ```properties
   db.password=TU_CONTRASEÑA_MYSQL
   ```

---

### Error: "Unknown database 'cafebar_db'"

**Solución:**
Ejecuta primero el script de creación de BD:

**PowerShell:**
```powershell
mysql -u root -p
# Luego dentro de MySQL:
source database/cafebar_schema.sql
exit
```

**CMD:**
```cmd
mysql -u root -p < database\cafebar_schema.sql
```

---

## 🎯 RESUMEN RÁPIDO

**SI ESTÁS EN POWERSHELL:**
```powershell
cd C:\Users\USER\Desktop\cafebar-sean\cafebar-java
.\compilar.ps1
.\ejecutar.ps1
```

**SI ESTÁS EN CMD:**
```cmd
cd C:\Users\USER\Desktop\cafebar-sean\cafebar-java
compilar.bat
ejecutar.bat
```

**¡ESO ES TODO!** ✅

---

## 📸 PARA TU ENTREGA

Una vez que el programa esté ejecutándose:

1. **Toma captura** de la pantalla de inicio (muestra la conexión JDBC)
2. Selecciona **Opción 1** → Toma captura del CRUD de Usuarios
3. Selecciona **Opción 2** → Toma captura del CRUD de Productos
4. Selecciona **Opción 3** → Toma captura de Consultas Avanzadas
5. Selecciona **Opción 4** → Toma captura de Autenticación

¡Esas son las evidencias que necesitas para tu PDF! 📄
