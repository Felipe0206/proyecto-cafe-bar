# Sistema de Gestión Café Bar

Sistema web completo para la gestión de un café bar, desarrollado con arquitectura cliente-servidor usando **Java Servlets** en el backend y **React** en el frontend.

---

## Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│             CLIENTE               │
│        React + Vite (puerto 5173)          │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ │
│  │ /cliente │ │/trabajador│ │ /admin │ │ /login │ │
│  └──────────┘ └───────────┘ └──────────┘ └──────────┘ │
└─────────────────────────┬────────────────────────────────────┘
             │ HTTP REST (JSON)
             │ fetch() / axios
┌─────────────────────────▼────────────────────────────────────┐
│            SERVIDOR               │
│      Apache Tomcat 9.0.95 (puerto 8080)        │
│                               │
│  Java Servlets ──► JDBC ──► MySQL (cafe_bar_db)     │
│                               │
│  /api/login    /api/productos   /api/pedidos     │
│  /api/usuarios   /api/categorias  /api/reservas     │
│  /api/mesas                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 18 |
| Build tool | Vite | 5 |
| Enrutamiento | React Router DOM | 6 |
| HTTP Client | Axios | — |
| QR Codes | qrcode.react | — |
| Íconos | Material Icons (Google Fonts) | — |
| Backend | Java Servlets (javax.servlet) | JDK 21 |
| Servidor | Apache Tomcat | 9.0.95 |
| Persistencia | JDBC directo | — |
| Driver BD | MySQL Connector/J | 9.5.0 |
| Base de datos | MySQL | 8.4 |

---

## Estructura del Proyecto

```
cafebar-sean/
│
├── apache-tomcat-9.0.95/      ← Servidor con la app desplegada
│  └── webapps/cafebar/
│    └── WEB-INF/
│      ├── classes/      ← Servlets compilados (.class)
│      ├── lib/        ← mysql-connector.jar
│      └── web.xml       ← Configuración de la webapp
│
├── cafebar-java/          ← Código fuente del backend
│  ├── src/main/java/com/cafebar/
│  │  ├── config/
│  │  │  └── DatabaseConnection.java  ← Singleton de conexión JDBC
│  │  ├── models/            ← POJOs (Usuario, Mesa, Pedido...)
│  │  ├── dao/             ← Acceso a datos con JDBC
│  │  └── servlets/api/         ← Endpoints REST
│  │    ├── ApiHelper.java      ← CORS, parseo JSON, respuestas
│  │    ├── LoginAPIServlet.java
│  │    ├── UsuariosAPIServlet.java
│  │    ├── ProductosAPIServlet.java
│  │    ├── CategoriasAPIServlet.java
│  │    ├── MesaAPIServlet.java
│  │    ├── PedidosAPIServlet.java  ← Crea detalle_pedido en init()
│  │    └── ReservasAPIServlet.java
│  ├── database/
│  │  └── cafebar_schema.sql      ← Script de creación de BD
│  └── lib/
│    └── mysql-connector-j-9.5.0.jar
│
└── cafebar-react/         ← Código fuente del frontend
  └── src/
    ├── context/
    │  └── AuthContext.jsx   ← Estado global del usuario (login/logout)
    ├── services/
    │  └── api.js       ← Funciones HTTP hacia la API REST
    ├── pages/
    │  ├── common/
    │  │  └── Login.jsx
    │  ├── cliente/
    │  │  ├── Menu.jsx    ← Menú público con QR + carrito + registro
    │  │  ├── Pedidos.jsx
    │  │  └── Reservas.jsx
    │  ├── trabajador/
    │  │  ├── Dashboard.jsx
    │  │  ├── Pedidos.jsx
    │  │  ├── Mesas.jsx
    │  │  ├── Inventario.jsx
    │  │  └── Incidencias.jsx
    │  └── administrador/
    │    ├── Dashboard.jsx
    │    ├── Usuarios.jsx
    │    ├── Productos.jsx
    │    ├── Mesas.jsx    ← Genera códigos QR por mesa
    │    ├── Pedidos.jsx
    │    ├── Reservas.jsx
    │    └── Reportes.jsx
    └── App.jsx         ← Rutas protegidas por rol
```

---

## Roles y Módulos

| Rol | Ruta base | Módulos disponibles |
|-----|-----------|---------------------|
| `cliente` / `cajero` | `/cliente/` | Menú, Mis Pedidos, Reservas |
| `mesero` / `chef` | `/trabajador/` | Dashboard, Pedidos, Mesas, Inventario, Incidencias |
| `administrador` / `gerente` | `/admin/` | Dashboard, Usuarios, Productos, Mesas+QR, Pedidos, Reservas, Reportes |

> El menú (`/cliente/menu`) es **público** — no requiere login para navegar.
> Solo al confirmar un pedido se solicita registro o login.

---

## Cómo Iniciar el Sistema

### Requisitos previos
- Java JDK 21
- MySQL 8.4 corriendo en puerto `3306`
- Node.js + npm

### Paso 1 — Base de datos
```sql
-- Crear BD y tablas
mysql -u root -p < cafebar-java/database/cafebar_schema.sql
```

### Paso 2 — Backend (Tomcat)
```bash
cd apache-tomcat-9.0.95/bin

# Windows
startup.bat

# Linux / Mac
./startup.sh
```
Tomcat inicia en: `http://localhost:8080`

### Paso 3 — Frontend (React)
```bash
cd cafebar-react
npm install
npm run dev
```
React inicia en: `http://localhost:5173`

### Paso 4 — Acceder
```
http://localhost:5173
```

---

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@cafebar.com | 123456 | administrador |
| gerente@cafebar.com | 123456 | gerente |
| carlos@cafebar.com | 123456 | mesero |
| ana@cafebar.com | 123456 | chef |
| cliente@test.com | 123456 | cajero (acceso cliente) |

---

## API REST

**Base URL:** `http://localhost:8080/cafebar/api`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/login` | Autenticación, retorna token de sesión |
| GET / POST / PUT / DELETE | `/usuarios` | CRUD de usuarios del sistema |
| GET / POST / PUT / DELETE | `/productos` | CRUD de productos del menú |
| GET | `/categorias` | Listado de categorías activas |
| GET / POST / PUT / DELETE | `/mesas` | Gestión de mesas y códigos QR |
| GET / POST / PUT | `/pedidos` | Pedidos con items (detalle_pedido) |
| GET / POST / PUT / DELETE | `/reservas` | Reservas de mesas |

**Formato de respuesta:**
```json
// Éxito
{ "success": true, "data": [...], "count": 7 }

// Error
{ "success": false, "message": "Descripción del error" }
```

---

## Flujo QR → Pedido (sin login previo)

```
[Admin] Genera QR en /admin/mesas
      │
      ▼
     URL: http://localhost:5173/cliente/menu?mesa=3
      │
[Cliente] Escanea QR con el celular
      │
      ▼
     Menú carga con Mesa #3 pre-seleccionada
     (no requiere login para ver el menú)
      │
[Cliente] Agrega productos al carrito
      │
      ▼
     Clic en "Realizar Pedido"
      │
      ▼
     Modal de Registro / Login
      │
[Cliente] Se registra (nombre, email, contraseña)
      │
      ▼
     Login automático + pedido creado
      │
[Trabajador] Ve el pedido en /trabajador/pedidos
```

---

## Base de Datos — Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema con roles |
| `clientes` | Perfil de cliente vinculado a usuario |
| `categorias` | Categorías del menú |
| `productos` | Productos con precio, stock, disponibilidad |
| `mesas` | Mesas con estado y código QR |
| `pedidos` | Cabecera del pedido |
| `detalle_pedido` | Items de cada pedido |
| `reservas` | Reservas de mesas con fecha/hora |

---

## Autores

**Andrés Felipe Gil Gallo · Carlos Alberto Ruiz Burbano · Juan Diego Ríos Franco**
SENA — Tecnología en Análisis y Desarrollo de Software
