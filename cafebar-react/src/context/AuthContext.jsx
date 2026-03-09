import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context de Autenticación
 * Maneja el estado del usuario logueado y sus permisos
 */
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login de usuario
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/cafebar/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.usuario.idUsuario,
          clienteId: data.usuario.clienteId,
          nombre: data.usuario.nombre,
          email: data.usuario.email,
          rol: data.usuario.rol,
          activo: data.usuario.activo
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  /**
   * Logout de usuario
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (rol) => {
    return user && user.rol === rol;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
