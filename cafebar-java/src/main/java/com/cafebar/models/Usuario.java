package com.cafebar.models;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Clase modelo que representa un Usuario del sistema
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
@Table(name = "usuarios")
public class Usuario {

    // ============================================
    // ATRIBUTOS MAPEADOS A LA TABLA 'usuarios'
    // ============================================

    /**
     * ID del usuario (Primary Key)
     * Generado automáticamente por la base de datos
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuario_id", nullable = false)
    private int usuarioId;

    /**
     * Nombre de usuario para login
     * Único en el sistema
     */
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    /**
     * Contraseña hasheada del usuario
     */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /**
     * Rol del usuario en el sistema
     * Valores permitidos: administrador, gerente, mesero, chef, cajero, barista
     */
    @Column(name = "rol", nullable = false, length = 20)
    private String rol;

    /**
     * Nombre completo del usuario
     */
    @Column(name = "nombre_completo", nullable = false, length = 100)
    private String nombreCompleto;

    /**
     * Email del usuario
     * Único en el sistema
     */
    @Column(name = "email", unique = true, length = 100)
    private String email;

    /**
     * Teléfono del usuario
     */
    @Column(name = "telefono", length = 20)
    private String telefono;

    /**
     * Estado del usuario (activo/inactivo)
     */
    @Column(name = "activo", nullable = false)
    private boolean activo;

    /**
     * Fecha de contratación del empleado
     */
    @Column(name = "fecha_contratacion")
    private java.sql.Date fechaContratacion;

    /**
     * Salario del empleado
     */
    @Column(name = "salario", precision = 10, scale = 2)
    private BigDecimal salario;

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
     * Fecha y hora del último acceso al sistema
     */
    @Column(name = "ultimo_acceso")
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp ultimoAcceso;

    // ============================================
    // CONSTRUCTORES
    // ============================================

    /**
     * Constructor vacío requerido por JPA/Hibernate
     */
    public Usuario() {
        this.activo = true;
    }

    /**
     * Constructor con parámetros principales
     *
     * @param username       Nombre de usuario
     * @param passwordHash   Contraseña hasheada
     * @param rol            Rol del usuario
     * @param nombreCompleto Nombre completo
     */
    public Usuario(String username, String passwordHash, String rol, String nombreCompleto) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.rol = rol;
        this.nombreCompleto = nombreCompleto;
        this.activo = true;
    }

    // ============================================
    // GETTERS Y SETTERS
    // ============================================

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public java.sql.Date getFechaContratacion() {
        return fechaContratacion;
    }

    public void setFechaContratacion(java.sql.Date fechaContratacion) {
        this.fechaContratacion = fechaContratacion;
    }

    public BigDecimal getSalario() {
        return salario;
    }

    public void setSalario(BigDecimal salario) {
        this.salario = salario;
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

    public Timestamp getUltimoAcceso() {
        return ultimoAcceso;
    }

    public void setUltimoAcceso(Timestamp ultimoAcceso) {
        this.ultimoAcceso = ultimoAcceso;
    }

    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================

    /**
     * Representación en String del usuario
     *
     * @return String con información del usuario
     */
    @Override
    public String toString() {
        return "Usuario{" +
                "usuarioId=" + usuarioId +
                ", username='" + username + '\'' +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", email='" + email + '\'' +
                ", rol='" + rol + '\'' +
                ", activo=" + activo +
                '}';
    }
}
