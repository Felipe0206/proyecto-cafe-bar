# Café Bar — Frontend (React + Vite)

Módulo frontend del sistema de gestión Café Bar. Aplicación de página única (SPA) construida con React, que consume la API REST del backend Java.

---

## Tecnologías

| Paquete | Uso |
|---------|-----|
| React 18 | Librería de UI |
| Vite 5 | Bundler y servidor de desarrollo |
| React Router DOM 6 | Navegación SPA con rutas protegidas |
| Axios | Cliente HTTP para llamadas a la API |
| qrcode.react | Generación de códigos QR |
| Material Icons | Íconos (via Google Fonts CDN) |

---

## Estructura de Carpetas

```
cafebar-react/src/
│
├── App.jsx          ← Rutas y protección por rol
├── App.css          ← Estilos globales y navbar
├── main.jsx          ← Punto de entrada
│
├── context/
│  └── AuthContext.jsx    ← Estado global: user, login(), logout()
│
├── services/
│  └── api.js         ← Todas las llamadas HTTP (axios)
│
└── pages/
  ├── common/
  │  ├── Login.jsx     ← Formulario de login con redirección
  │  └── Login.css
  │
  ├── cliente/
  │  ├── Menu.jsx      ← Menú público, carrito, registro, QR
  │  ├── Menu.css
  │  ├── Pedidos.jsx    ← Historial de pedidos del cliente
  │  ├── Reservas.jsx    ← Crear y ver reservas
  │  └── Reservas.css
  │
  ├── trabajador/
  │  ├── Dashboard.jsx   ← Resumen de pedidos activos
  │  ├── Pedidos.jsx    ← Gestión de pedidos (cambiar estado)
  │  ├── Mesas.jsx     ← Estado de mesas en tiempo real
  │  ├── Inventario.jsx   ← Control de stock de productos
  │  └── Incidencias.jsx  ← Reporte de incidencias
  │
  └── administrador/
    ├── Dashboard.jsx   ← Métricas y resumen general
    ├── Usuarios.jsx    ← CRUD de usuarios del sistema
    ├── Productos.jsx   ← CRUD de productos del menú
    ├── Mesas.jsx     ← CRUD de mesas + generación de QR
    ├── Pedidos.jsx    ← Gestión completa de pedidos
    ├── Reservas.jsx    ← Gestión de reservas
    └── Reportes.jsx    ← Reportes de ventas y actividad
```

---

## Sistema de Autenticación

El estado del usuario se maneja con **React Context** (`AuthContext`):

```jsx
const { user, login, logout } = useAuth();

// user contiene:
{
 id: 1,
 clienteId: 4,
 nombre: "Administrador Sistema",
 email: "admin@cafebar.com",
 rol: "administrador"
}
```

El token se guarda en `localStorage` y persiste entre recargas.

---

## Rutas Protegidas por Rol

```jsx
// App.jsx
const ROLES_CLIENTE  = ['cliente', 'cajero']
const ROLES_TRABAJADOR = ['trabajador', 'mesero', 'chef']
const ROLES_ADMIN   = ['administrador', 'gerente']

// Ruta pública (sin login)
<Route path="/cliente/menu" element={<MenuCliente />} />

// Ruta protegida
<Route path="/admin/usuarios"
 element={
  <ProtectedRoute allowedRoles={ROLES_ADMIN}>
   <Layout><Usuarios /></Layout>
  </ProtectedRoute>
 }
/>
```

Si el usuario no está autenticado, es redirigido a `/login?from=URL_ORIGINAL` para volver después del login.

---

## Llamadas a la API

Todas las llamadas HTTP están centralizadas en `src/services/api.js`:

```js
productoService.getAll()      // GET /api/productos
pedidoService.create(data)     // POST /api/pedidos
reservaService.getByUsuario(id)  // GET /api/reservas?usuario=id
mesaService.update(id, data)    // PUT /api/mesas
```

La URL base apunta a `http://localhost:8080/cafebar/api`.

---

## Flujo del Menú Público con QR

```
URL: /cliente/menu?mesa=3
     │
Menu.jsx lee ?mesa= con useSearchParams()
     │
Usuario navega y agrega al carrito (sin login)
     │
Clic "Realizar Pedido"
     │
  ¿Está logueado?
  ├── Sí → enviarPedido()
  └── No → Modal Registro / Login
        │
     Se registra o inicia sesión
        │
     enviarPedido() automático
```

---

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (hot reload)
npm run dev
# → http://localhost:5173

# Build para producción
npm run build
```

---

## Autores

**Andrés Felipe Gil Gallo**
SENA — Tecnología en Análisis y Desarrollo de Software
