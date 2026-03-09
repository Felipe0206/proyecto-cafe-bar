package com.cafebar.servlets.api;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

/**
 * Clase utilitaria para los API Servlets del Café Bar
 * Maneja CORS, lectura de JSON y construcción de respuestas
 *
 * @author Andrés Felipe Gil Gallo
 * @version 1.0
 */
public class ApiHelper {

    /**
     * Configura las cabeceras CORS para permitir peticiones desde React (5173)
     */
    public static void setCors(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
    }

    /**
     * Lee el cuerpo JSON de una petición HTTP
     */
    public static String readBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line);
        return sb.toString();
    }

    /**
     * Extrae el valor de una clave en un JSON simple
     */
    public static String getJson(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return null;
        int colon = json.indexOf(":", idx + search.length());
        if (colon < 0) return null;
        String rest = json.substring(colon + 1).trim();
        if (rest.startsWith("\"")) {
            int end = rest.indexOf("\"", 1);
            return end < 0 ? null : rest.substring(1, end);
        } else {
            int end = rest.indexOf(",");
            int end2 = rest.indexOf("}");
            if (end < 0) end = end2;
            else if (end2 >= 0 && end2 < end) end = end2;
            return end < 0 ? rest.trim() : rest.substring(0, end).trim();
        }
    }

    /**
     * Escapa caracteres especiales para JSON
     */
    public static String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }

    /**
     * Respuesta de error en JSON
     */
    public static String error(String msg) {
        return "{\"success\":false,\"message\":\"" + esc(msg) + "\"}";
    }

    /**
     * Respuesta de éxito simple
     */
    public static String ok(String msg) {
        return "{\"success\":true,\"message\":\"" + esc(msg) + "\"}";
    }
}
