package com.cafebar.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Clase de configuración de conexión a base de datos usando JDBC
 * Implementa el patrón Singleton para garantizar una única instancia
 *
 * @author Sistema Café Bar
 * @version 1.0
 */
public class DatabaseConnection {

    // Instancia única (Patrón Singleton)
    private static DatabaseConnection instance;

    // Objeto Connection de JDBC
    private Connection connection;

    // Propiedades de configuración
    private String driver;
    private String url;
    private String username;
    private String password;

    /**
     * Constructor privado para implementar Singleton
     * Carga las propiedades desde el archivo database.properties
     */
    private DatabaseConnection() {
        try {
            // Cargar propiedades de configuración
            loadProperties();

            // Cargar el driver JDBC
            Class.forName(driver);

            System.out.println("✓ Driver JDBC cargado correctamente: " + driver);

        } catch (ClassNotFoundException e) {
            System.err.println("✗ Error: No se encontró el driver JDBC");
            e.printStackTrace();
        } catch (IOException e) {
            System.err.println("✗ Error: No se pudo cargar el archivo de propiedades");
            e.printStackTrace();
        }
    }

    /**
     * Método para cargar las propiedades desde el archivo de configuración
     * @throws IOException si hay error al leer el archivo
     */
    private void loadProperties() throws IOException {
        Properties props = new Properties();

        // Intentar cargar desde resources
        try (InputStream input = getClass().getClassLoader()
                .getResourceAsStream("database.properties")) {

            if (input == null) {
                System.err.println("✗ No se encontró database.properties");
                // Usar valores por defecto
                setDefaultProperties();
                return;
            }

            // Cargar propiedades
            props.load(input);

            // Asignar valores
            this.driver = props.getProperty("db.driver");
            this.url = props.getProperty("db.url");
            this.username = props.getProperty("db.username");
            this.password = props.getProperty("db.password");

            System.out.println("✓ Propiedades de BD cargadas correctamente");

        } catch (IOException e) {
            System.err.println("✗ Error al cargar propiedades");
            setDefaultProperties();
        }
    }

    /**
     * Establece propiedades por defecto si no se puede cargar el archivo
     */
    private void setDefaultProperties() {
        this.driver = "com.mysql.cj.jdbc.Driver";
        this.url = "jdbc:mysql://localhost:3306/cafe_bar_db?useSSL=false&serverTimezone=UTC";
        this.username = "root";
        this.password = "Andres.0206";
        System.out.println("⚠ Usando propiedades por defecto");
    }

    /**
     * Obtiene la instancia única de DatabaseConnection (Singleton)
     * @return Instancia de DatabaseConnection
     */
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }

    /**
     * Obtiene una conexión a la base de datos
     * Si no existe conexión o está cerrada, crea una nueva
     *
     * @return Objeto Connection
     * @throws SQLException si hay error en la conexión
     */
    public Connection getConnection() throws SQLException {
        try {
            // Crear siempre una conexión nueva para evitar conflictos entre hilos
            Connection conn = DriverManager.getConnection(url, username, password);
            System.out.println("✓ Conexión establecida con la base de datos");
            System.out.println("  URL: " + url);
            System.out.println("  Usuario: " + username);
            return conn;

        } catch (SQLException e) {
            System.err.println("✗ Error al conectar con la base de datos");
            System.err.println("  URL: " + url);
            System.err.println("  Usuario: " + username);
            System.err.println("  Mensaje: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Cierra la conexión a la base de datos
     */
    public void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("✓ Conexión cerrada correctamente");
            }
        } catch (SQLException e) {
            System.err.println("✗ Error al cerrar la conexión");
            e.printStackTrace();
        }
    }

    /**
     * Método para probar la conexión a la base de datos
     * @return true si la conexión es exitosa, false en caso contrario
     */
    public boolean testConnection() {
        try {
            Connection conn = getConnection();
            if (conn != null && !conn.isClosed()) {
                System.out.println("✓ Prueba de conexión exitosa");
                System.out.println("  Catálogo: " + conn.getCatalog());
                System.out.println("  Base de datos: " + conn.getMetaData().getDatabaseProductName());
                System.out.println("  Versión: " + conn.getMetaData().getDatabaseProductVersion());
                return true;
            }
        } catch (SQLException e) {
            System.err.println("✗ Prueba de conexión fallida");
            e.printStackTrace();
        }
        return false;
    }

    // Getters
    public String getDriver() { return driver; }
    public String getUrl() { return url; }
    public String getUsername() { return username; }
}
