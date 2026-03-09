# Café Bar — Backend (Java Servlets + JDBC)

Módulo backend del sistema de gestión Café Bar. Expone una **API REST** mediante Java Servlets sobre Apache Tomcat, con acceso directo a MySQL vía JDBC.

---

## Arquitectura del Backend

El flujo de cada petición HTTP es el siguiente:

```
HTTP Request
    →  @WebServlet (Java Servlet)
    →  ApiHelper (CORS + parseo JSON)
    →  JDBC PreparedStatement
    →  MySQL cafe_bar_db
    →  JSON Response
```

Ejemplo de respuesta:
```json
{ "success": true, "data": [...] }
```

---

## Estructura de Carpetas

```
cafebar-java/
├── src/main/java/com/cafebar/
│  ├── config/
│  │  └── DatabaseConnection.java  ← Singleton, lee database.properties
│  ├── models/            ← Clases de dominio (sin anotaciones ORM)
│  │  ├── Usuario.java
│  │  ├── Producto.java
│  │  ├── Categoria.java
│  │  ├── Mesa.java
│  │  ├── Pedido.java
│  │  ├── DetallePedido.java
│  │  └── Reserva.java
│  ├── dao/              ← Data Access Objects con JDBC
│  │  ├── UsuarioDAO.java
│  │  ├── ProductoDAO.java
│  │  ├── CategoriaDAO.java
│  │  ├── MesaDAO.java
│  │  ├── PedidoDAO.java
│  │  └── ReservaDAO.java
│  └── servlets/api/         ← Controladores REST
│    ├── ApiHelper.java       ← Utilitario CORS, parseo, respuestas
│    ├── LoginAPIServlet.java    ← POST /api/login
│    ├── UsuariosAPIServlet.java  ← CRUD /api/usuarios
│    ├── ProductosAPIServlet.java  ← CRUD /api/productos
│    ├── CategoriasAPIServlet.java ← GET /api/categorias
│    ├── MesaAPIServlet.java    ← CRUD /api/mesas
│    ├── PedidosAPIServlet.java   ← CRUD /api/pedidos + detalle
│    └── ReservasAPIServlet.java  ← CRUD /api/reservas
│
├── database/
│  └── cafebar_schema.sql       ← Script DDL + datos de prueba
│
└── lib/
  └── mysql-connector-j-9.5.0.jar  ← Driver JDBC
```

---

## Configuración de la Base de Datos

El archivo de configuración está en Tomcat:
```
apache-tomcat-9.0.95/webapps/cafebar/WEB-INF/classes/database.properties
```

```properties
db.url=jdbc:mysql://localhost:3306/cafe_bar_db?useSSL=false&serverTimezone=UTC
db.username=root
db.password=tu_password
```

---

## Cómo Compilar los Servlets

```bash
# Variables de entorno
WEBINF="ruta/apache-tomcat-9.0.95/webapps/cafebar/WEB-INF"
TOMCAT="ruta/apache-tomcat-9.0.95"
SRC="ruta/cafebar-java/src/main/java"

# Compilar todos los servlets
javac -cp "$WEBINF/lib/mysql-connector-j-9.5.0.jar;$TOMCAT/lib/servlet-api.jar;$WEBINF/classes" \
 -d "$WEBINF/classes" \
 "$SRC/com/cafebar/config/DatabaseConnection.java" \
 "$SRC/com/cafebar/servlets/api/ApiHelper.java" \
 "$SRC/com/cafebar/servlets/api/LoginAPIServlet.java" \
 "$SRC/com/cafebar/servlets/api/UsuariosAPIServlet.java" \
 "$SRC/com/cafebar/servlets/api/ProductosAPIServlet.java" \
 "$SRC/com/cafebar/servlets/api/CategoriasAPIServlet.java" \
 "$SRC/com/cafebar/servlets/api/MesaAPIServlet.java" \
 "$SRC/com/cafebar/servlets/api/PedidosAPIServlet.java" \
 "$SRC/com/cafebar/servlets/api/ReservasAPIServlet.java"
```

> Después de compilar, **reiniciar Tomcat** para cargar las nuevas clases.

---

## Endpoints de la API

### POST `/api/login`
```json
// Request
{ "email": "admin@cafebar.com", "password": "123456" }

// Response
{
 "success": true,
 "usuario": {
  "idUsuario": 1, "clienteId": 4,
  "nombre": "Administrador Sistema",
  "email": "admin@cafebar.com",
  "rol": "administrador"
 }
}
```

### GET `/api/productos`
```json
{
 "success": true,
 "data": [
  {
   "idProducto": 1, "nombre": "Café Americano",
   "precio": 4500.00, "categoriaId": 1,
   "categoria": "Bebidas Calientes",
   "disponible": true, "stock": 50
  }
 ],
 "count": 7
}
```

### POST `/api/pedidos`
```json
// Request — incluye array de items
{
 "idMesa": "1",
 "clienteId": "3",
 "total": "11000",
 "tipoPedido": "mesa",
 "items": [
  { "idProducto": "1", "cantidad": "2", "precio": "4500" },
  { "idProducto": "2", "cantidad": "1", "precio": "6500" }
 ]
}

// Response
{ "success": true, "id": 8, "codigoPedido": "P7511431" }
```

---

## Tablas de la Base de Datos

| Tabla | Columnas clave |
|-------|---------------|
| `usuarios` | `usuario_id`, `username`, `password_hash`, `nombre_completo`, `email`, `rol`, `activo` |
| `clientes` | `cliente_id`, `nombre`, `email`, `usuario_id` |
| `categorias` | `categoria_id`, `nombre`, `icono`, `activo` |
| `productos` | `producto_id`, `nombre`, `precio`, `categoria_id`, `disponible`, `stock` |
| `mesas` | `mesa_id`, `numero_mesa`, `capacidad`, `estado`, `codigo_qr` |
| `pedidos` | `pedido_id`, `mesa_id`, `cliente_id`, `codigo_pedido`, `estado`, `total` |
| `detalle_pedido` | `detalle_id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal` |
| `reservas` | `reserva_id`, `cliente_id`, `mesa_id`, `fecha_reserva`, `hora_reserva`, `estado` |

**Roles válidos en DB:** `administrador`, `gerente`, `mesero`, `chef`, `cajero`, `barista`, `cliente`

---

## Detalles Técnicos Importantes

- **Tomcat 9** usa `javax.servlet.*` — NO usar `jakarta.servlet.*` (eso es Tomcat 10+)
- **CORS** habilitado en `ApiHelper.setCors()` para `http://localhost:5173`
- **`PedidosAPIServlet`** crea la tabla `detalle_pedido` automáticamente en `init()` si no existe
- **`LoginAPIServlet`** crea automáticamente un registro en `clientes` al autenticar
- **Parseo JSON manual** — sin librerías externas, usando `ApiHelper.getJson()`
- **Contraseñas** almacenadas en texto plano en `password_hash` (entorno académico)
- El archivo **`cafebar.war` fue eliminado** — Tomcat usa el directorio desplegado directamente

---

## Autores

**Andrés Felipe Gil Gallo**
SENA — Tecnología en Análisis y Desarrollo de Software
