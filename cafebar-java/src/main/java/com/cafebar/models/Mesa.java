package com.cafebar.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Entidad JPA que representa una Mesa del café/bar
 * Framework: Hibernate ORM
 * Evidencia: GA7-220501096-AA3-EV01
 *
 * @author Sistema Café Bar
 * @version 2.0 - Migrado a JPA/Hibernate
 */
@Entity
@Table(name = "mesas")
public class Mesa {

    // ============================================
    // ATRIBUTOS CON ANOTACIONES JPA
    // ============================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mesa")
    private int idMesa;

    @Column(name = "numero_mesa", nullable = false, unique = true)
    private int numeroMesa;

    @Column(name = "capacidad", nullable = false)
    private int capacidad;

    @Column(name = "tipo_mesa", nullable = false, length = 50)
    private String tipoMesa; // cuadrada, redonda, rectangular, rectangular_grande, barra

    @Column(name = "ubicacion", nullable = false, length = 50)
    private String ubicacion; // interior, terraza, area_vip

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "disponible"; // disponible, ocupada, reservada, mantenimiento

    @Column(name = "codigo_qr", unique = true, length = 100)
    private String codigoQr;

    @Column(name = "posicion_x", precision = 10, scale = 2)
    private BigDecimal posicionX;

    @Column(name = "posicion_y", precision = 10, scale = 2)
    private BigDecimal posicionY;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp fechaCreacion;

    // ============================================
    // CONSTRUCTORES
    // ============================================

    /**
     * Constructor vacío requerido por JPA
     */
    public Mesa() {
        this.estado = "disponible";
    }

    /**
     * Constructor con parámetros principales
     */
    public Mesa(int numeroMesa, int capacidad, String tipoMesa, String ubicacion) {
        this.numeroMesa = numeroMesa;
        this.capacidad = capacidad;
        this.tipoMesa = tipoMesa;
        this.ubicacion = ubicacion;
        this.estado = "disponible";
    }

    // ============================================
    // MÉTODOS DEL CICLO DE VIDA JPA
    // ============================================

    /**
     * Se ejecuta automáticamente antes de persist()
     */
    @PrePersist
    protected void onCreate() {
        fechaCreacion = new Timestamp(System.currentTimeMillis());
        if (codigoQr == null) {
            codigoQr = "MESA-" + numeroMesa + "-" + System.currentTimeMillis();
        }
    }

    // ============================================
    // GETTERS Y SETTERS
    // ============================================

    public int getIdMesa() {
        return idMesa;
    }

    public void setIdMesa(int idMesa) {
        this.idMesa = idMesa;
    }

    public int getNumeroMesa() {
        return numeroMesa;
    }

    public void setNumeroMesa(int numeroMesa) {
        this.numeroMesa = numeroMesa;
    }

    public int getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public String getTipoMesa() {
        return tipoMesa;
    }

    public void setTipoMesa(String tipoMesa) {
        this.tipoMesa = tipoMesa;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getCodigoQr() {
        return codigoQr;
    }

    public void setCodigoQr(String codigoQr) {
        this.codigoQr = codigoQr;
    }

    public BigDecimal getPosicionX() {
        return posicionX;
    }

    public void setPosicionX(BigDecimal posicionX) {
        this.posicionX = posicionX;
    }

    public BigDecimal getPosicionY() {
        return posicionY;
    }

    public void setPosicionY(BigDecimal posicionY) {
        this.posicionY = posicionY;
    }

    public Timestamp getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Timestamp fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    // ============================================
    // MÉTODOS UTILITARIOS
    // ============================================

    /**
     * Verifica si la mesa está disponible
     */
    public boolean estaDisponible() {
        return "disponible".equals(this.estado);
    }

    /**
     * Verifica si la mesa está ocupada
     */
    public boolean estaOcupada() {
        return "ocupada".equals(this.estado);
    }

    /**
     * Marca la mesa como ocupada
     */
    public void ocupar() {
        this.estado = "ocupada";
    }

    /**
     * Libera la mesa (la marca como disponible)
     */
    public void liberar() {
        this.estado = "disponible";
    }

    @Override
    public String toString() {
        return "Mesa{" +
                "idMesa=" + idMesa +
                ", numeroMesa=" + numeroMesa +
                ", capacidad=" + capacidad +
                ", tipoMesa='" + tipoMesa + '\'' +
                ", ubicacion='" + ubicacion + '\'' +
                ", estado='" + estado + '\'' +
                ", codigoQr='" + codigoQr + '\'' +
                '}';
    }
}
