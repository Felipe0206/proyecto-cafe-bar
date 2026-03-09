package com.cafebar.models;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Clase modelo que representa un Producto del menú
 * Anotada con JPA/Hibernate para mapeo ORM
 * Adaptada al esquema cafe_bar_db
 *
 * Evidencia: GA7-220501096-AA3-EV01
 * Framework: Hibernate ORM
 *
 * @author Andrés Felipe Gil Gallo
 * @author Carlos Alberto Ruiz Burbano
 * @author Juan Diego Ríos Franco
 * @version 2.0 (Hibernate ORM)
 */
@Entity
@Table(name = "productos")
public class Producto {

    // ============================================
    // ATRIBUTOS MAPEADOS A LA TABLA 'productos'
    // ============================================

    /**
     * ID del producto (Primary Key)
     * Generado automáticamente por la base de datos
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "producto_id", nullable = false)
    private int productoId;

    /**
     * Nombre del producto
     */
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    /**
     * Descripción del producto
     */
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    /**
     * Precio de venta del producto
     */
    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    /**
     * Costo de producción del producto
     */
    @Column(name = "costo", precision = 10, scale = 2)
    private BigDecimal costo;

    /**
     * ID de la categoría a la que pertenece el producto
     * Foreign Key hacia tabla 'categorias'
     */
    @Column(name = "categoria_id", nullable = false)
    private int categoriaId;

    /**
     * Indica si el producto está disponible para venta
     */
    @Column(name = "disponible", nullable = false)
    private boolean disponible;

    /**
     * URL de la imagen del producto
     */
    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    /**
     * Tiempo de preparación en minutos
     */
    @Column(name = "tiempo_preparacion")
    private int tiempoPreparacion;

    /**
     * Ingredientes del producto
     */
    @Column(name = "ingredientes", columnDefinition = "TEXT")
    private String ingredientes;

    /**
     * Alérgenos presentes en el producto
     */
    @Column(name = "alergenos", length = 255)
    private String alergenos;

    /**
     * Nivel de dificultad de preparación
     * Valores: facil, medio, dificil
     */
    @Column(name = "nivel_preparacion", length = 20)
    private String nivelPreparacion;

    /**
     * Indica si el producto es popular
     */
    @Column(name = "es_popular", nullable = false)
    private boolean esPopular;

    /**
     * Indica si el producto es recomendado
     */
    @Column(name = "es_recomendado", nullable = false)
    private boolean esRecomendado;

    /**
     * Stock actual del producto
     */
    @Column(name = "stock", nullable = false)
    private int stock;

    /**
     * Stock mínimo para reabastecimiento
     */
    @Column(name = "stock_minimo", nullable = false)
    private int stockMinimo;

    /**
     * Fecha de creación del registro
     * Generada automáticamente por la base de datos
     */
    @Column(name = "fecha_creacion", updatable = false, insertable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp fechaCreacion;

    /**
     * Fecha de última actualización del registro
     * Actualizada automáticamente por la base de datos
     */
    @Column(name = "fecha_actualizacion", insertable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp fechaActualizacion;

    /**
     * Atributo adicional para el nombre de la categoría (JOIN)
     * No se mapea a una columna, se obtiene mediante consultas
     */
    @Transient
    private String nombreCategoria;

    // ============================================
    // CONSTRUCTORES
    // ============================================

    /**
     * Constructor vacío requerido por JPA/Hibernate
     */
    public Producto() {
        this.disponible = true;
    }

    /**
     * Constructor con parámetros principales
     *
     * @param categoriaId ID de la categoría
     * @param nombre      Nombre del producto
     * @param descripcion Descripción del producto
     * @param precio      Precio de venta
     */
    public Producto(int categoriaId, String nombre, String descripcion, BigDecimal precio) {
        this.categoriaId = categoriaId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.disponible = true;
    }

    // ============================================
    // GETTERS Y SETTERS
    // ============================================

    public int getProductoId() {
        return productoId;
    }

    public void setProductoId(int productoId) {
        this.productoId = productoId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public BigDecimal getCosto() {
        return costo;
    }

    public void setCosto(BigDecimal costo) {
        this.costo = costo;
    }

    public int getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(int categoriaId) {
        this.categoriaId = categoriaId;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public int getTiempoPreparacion() {
        return tiempoPreparacion;
    }

    public void setTiempoPreparacion(int tiempoPreparacion) {
        this.tiempoPreparacion = tiempoPreparacion;
    }

    public String getIngredientes() {
        return ingredientes;
    }

    public void setIngredientes(String ingredientes) {
        this.ingredientes = ingredientes;
    }

    public String getAlergenos() {
        return alergenos;
    }

    public void setAlergenos(String alergenos) {
        this.alergenos = alergenos;
    }

    public String getNivelPreparacion() {
        return nivelPreparacion;
    }

    public void setNivelPreparacion(String nivelPreparacion) {
        this.nivelPreparacion = nivelPreparacion;
    }

    public boolean isEsPopular() {
        return esPopular;
    }

    public void setEsPopular(boolean esPopular) {
        this.esPopular = esPopular;
    }

    public boolean isEsRecomendado() {
        return esRecomendado;
    }

    public void setEsRecomendado(boolean esRecomendado) {
        this.esRecomendado = esRecomendado;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public int getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(int stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public Timestamp getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Timestamp fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Timestamp getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(Timestamp fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public String getNombreCategoria() {
        return nombreCategoria;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }

    // ============================================
    // MÉTODOS DE NEGOCIO
    // ============================================

    /**
     * Calcula el margen de ganancia del producto
     *
     * @return BigDecimal con el porcentaje de margen
     */
    public BigDecimal calcularMargen() {
        if (costo != null && precio != null && costo.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ganancia = precio.subtract(costo);
            return ganancia.divide(costo, 2, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * Verifica si el producto necesita reabastecimiento
     *
     * @return true si el stock es igual o menor al mínimo
     */
    public boolean necesitaReabastecimiento() {
        return stock <= stockMinimo;
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    /**
     * Representación en String del producto
     *
     * @return String con información del producto
     */
    @Override
    public String toString() {
        return "Producto{" +
                "productoId=" + productoId +
                ", nombre='" + nombre + '\'' +
                ", precio=" + precio +
                ", disponible=" + disponible +
                ", stock=" + stock +
                ", categoria='" + nombreCategoria + '\'' +
                '}';
    }
}
