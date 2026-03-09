-- =============================================
-- SISTEMA DE GESTIÓN CAFÉ BAR
-- Script de creación de base de datos MySQL
-- =============================================

DROP DATABASE IF EXISTS cafebar_db;
CREATE DATABASE cafebar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE cafebar_db;

-- =============================================
-- TABLA: usuarios
-- Descripción: Gestión de usuarios del sistema
-- =============================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'trabajador', 'administrador') NOT NULL,
    telefono VARCHAR(20),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: mesas
-- Descripción: Gestión de mesas del café
-- =============================================
CREATE TABLE mesas (
    id_mesa INT AUTO_INCREMENT PRIMARY KEY,
    numero_mesa INT NOT NULL UNIQUE,
    capacidad INT NOT NULL,
    tipo_mesa ENUM('cuadrada', 'redonda', 'rectangular', 'rectangular_grande', 'barra') NOT NULL,
    ubicacion ENUM('interior', 'terraza', 'area_vip') NOT NULL,
    estado ENUM('disponible', 'ocupada', 'reservada', 'mantenimiento') DEFAULT 'disponible',
    codigo_qr VARCHAR(255) UNIQUE,
    posicion_x DECIMAL(10,2),
    posicion_y DECIMAL(10,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_numero (numero_mesa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: categorias
-- Descripción: Categorías de productos del menú
-- =============================================
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: productos
-- Descripción: Productos del menú
-- =============================================
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    costo DECIMAL(10,2),
    imagen_url VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    tiempo_preparacion INT DEFAULT 10 COMMENT 'Tiempo en minutos',
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE,
    INDEX idx_categoria (id_categoria),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: pedidos
-- Descripción: Pedidos realizados
-- =============================================
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_mesa INT NOT NULL,
    id_usuario INT,
    id_trabajador INT,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    estado ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    impuesto DECIMAL(10,2) DEFAULT 0.00,
    descuento DECIMAL(10,2) DEFAULT 0.00,
    notas TEXT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NULL,
    tiempo_preparacion INT COMMENT 'Tiempo real en minutos',
    FOREIGN KEY (id_mesa) REFERENCES mesas(id_mesa),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_trabajador) REFERENCES usuarios(id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_pedido),
    INDEX idx_numero_pedido (numero_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: detalle_pedido
-- Descripción: Productos incluidos en cada pedido
-- =============================================
CREATE TABLE detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    notas_producto TEXT,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    INDEX idx_pedido (id_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: reservas
-- Descripción: Reservas de mesas
-- =============================================
CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_mesa INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    numero_personas INT NOT NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    email_cliente VARCHAR(100),
    notas_especiales TEXT,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_mesa) REFERENCES mesas(id_mesa),
    INDEX idx_fecha_reserva (fecha_reserva, hora_reserva),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: inventario
-- Descripción: Control de inventario
-- =============================================
CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_item VARCHAR(100) NOT NULL,
    categoria_item ENUM('ingrediente', 'bebida', 'suministro', 'otro') NOT NULL,
    cantidad_actual DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    cantidad_minima DECIMAL(10,2) NOT NULL,
    costo_unitario DECIMAL(10,2),
    fecha_ultima_compra DATE,
    fecha_vencimiento DATE,
    proveedor VARCHAR(100),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria_item),
    INDEX idx_cantidad (cantidad_actual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: incidencias
-- Descripción: Reporte y seguimiento de incidencias
-- =============================================
CREATE TABLE incidencias (
    id_incidencia INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad ENUM('baja', 'media', 'alta', 'urgente') NOT NULL,
    tipo ENUM('tecnica', 'servicio', 'inventario', 'instalaciones', 'otro') NOT NULL,
    estado ENUM('abierta', 'en_proceso', 'resuelta', 'cerrada') DEFAULT 'abierta',
    id_usuario_reporta INT NOT NULL,
    id_usuario_asignado INT,
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP NULL,
    notas_resolucion TEXT,
    FOREIGN KEY (id_usuario_reporta) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_usuario_asignado) REFERENCES usuarios(id_usuario),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: proveedores
-- Descripción: Gestión de proveedores
-- =============================================
CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo ENUM('alimentos', 'bebidas', 'suministros', 'equipamiento', 'servicios') NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- TABLA: auditoria
-- Descripción: Registro de auditoría del sistema
-- =============================================
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    descripcion TEXT,
    ip_address VARCHAR(45),
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX idx_fecha (fecha_accion),
    INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- =============================================
-- DATOS DE PRUEBA
-- =============================================

-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES
('Cliente Demo', 'cliente@test.com', '123456', 'cliente', '3001234567'),
('Trabajador Demo', 'trabajador@test.com', '123456', 'trabajador', '3007654321'),
('Administrador Demo', 'admin@test.com', '123456', 'administrador', '3009876543');

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, icono, orden) VALUES
('Café', 'Café en todas sus variedades', '☕', 1),
('Bebidas Frías', 'Bebidas refrescantes', '🥤', 2),
('Postres', 'Postres y dulces', '🍰', 3),
('Comida', 'Platos principales y snacks', '🍽️', 4),
('Bebidas Calientes', 'Té, chocolate caliente', '🫖', 5);

-- Insertar productos
INSERT INTO productos (id_categoria, nombre, descripcion, precio, costo, disponible, tiempo_preparacion, stock_actual, stock_minimo) VALUES
(1, 'Café Americano', 'Café americano tradicional', 3500.00, 1200.00, TRUE, 5, 100, 10),
(1, 'Café Latte', 'Café con leche espumada', 4500.00, 1800.00, TRUE, 7, 100, 10),
(1, 'Cappuccino', 'Café con espuma de leche', 5000.00, 2000.00, TRUE, 8, 100, 10),
(2, 'Limonada Natural', 'Limonada fresca preparada', 4000.00, 1500.00, TRUE, 5, 50, 10),
(2, 'Jugo de Naranja', 'Jugo natural de naranja', 5000.00, 2000.00, TRUE, 5, 50, 10),
(3, 'Torta de Chocolate', 'Deliciosa torta de chocolate', 6000.00, 2500.00, TRUE, 3, 20, 5),
(3, 'Cheesecake', 'Tarta de queso estilo NY', 7000.00, 3000.00, TRUE, 3, 15, 5),
(4, 'Sandwich Club', 'Sandwich triple con pollo', 12000.00, 5000.00, TRUE, 15, 30, 5),
(4, 'Croissant', 'Croissant de mantequilla', 4500.00, 1800.00, TRUE, 5, 40, 10),
(5, 'Chocolate Caliente', 'Chocolate con leche caliente', 4500.00, 1800.00, TRUE, 7, 50, 10);

-- Insertar mesas
INSERT INTO mesas (numero_mesa, capacidad, tipo_mesa, ubicacion, estado, codigo_qr) VALUES
(1, 4, 'cuadrada', 'interior', 'disponible', 'QR-MESA-001'),
(2, 4, 'cuadrada', 'interior', 'disponible', 'QR-MESA-002'),
(3, 6, 'rectangular', 'interior', 'disponible', 'QR-MESA-003'),
(4, 4, 'redonda', 'terraza', 'disponible', 'QR-MESA-004'),
(5, 4, 'redonda', 'terraza', 'disponible', 'QR-MESA-005'),
(6, 8, 'rectangular_grande', 'area_vip', 'disponible', 'QR-MESA-006'),
(7, 3, 'barra', 'interior', 'disponible', 'QR-MESA-007'),
(8, 3, 'barra', 'interior', 'disponible', 'QR-MESA-008');

-- Insertar proveedores
INSERT INTO proveedores (nombre, tipo, contacto, telefono, email, direccion) VALUES
('Café Premium S.A.', 'bebidas', 'Juan Pérez', '3201234567', 'ventas@cafepremium.com', 'Calle 123 #45-67'),
('Lácteos La Vaca', 'alimentos', 'María González', '3107654321', 'pedidos@lacteos.com', 'Carrera 45 #12-34'),
('Distribuidora El Pan', 'alimentos', 'Carlos Rodríguez', '3159876543', 'info@elpan.com', 'Avenida 1 #23-45');

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
