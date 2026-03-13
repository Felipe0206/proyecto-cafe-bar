import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coffee } from 'lucide-react';
import './Login.css';

/**
 * Página de Login
 * Replica funcionalidad de index.html
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // URL a la que redirigir después del login (ej: /cliente/menu?mesa=6)
  const params = new URLSearchParams(location.search);
  const from = params.get('from');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        const user = JSON.parse(localStorage.getItem('user'));

        // Si hay URL de destino guardada y el rol tiene acceso, ir allí
        if (from) {
          const esCliente = ['cliente'].includes(user.rol);
          const esTrabajador = ['trabajador', 'mesero', 'chef', 'cajero'].includes(user.rol);
          const esAdmin = ['administrador', 'gerente'].includes(user.rol);
          const destinoCliente = from.startsWith('/cliente/');
          const destinoTrabajador = from.startsWith('/trabajador/');
          const destinoAdmin = from.startsWith('/admin/');

          if ((esCliente && destinoCliente) || (esTrabajador && destinoTrabajador) || (esAdmin && destinoAdmin)) {
            navigate(from);
            return;
          }
        }

        // Redirigir según rol (destino por defecto)
        switch (user.rol) {
          case 'cliente':
            navigate('/cliente/menu');
            break;
          case 'chef':
            navigate('/trabajador/pedidos');
            break;
          case 'trabajador':
          case 'mesero':
          case 'cajero':
            navigate('/trabajador/dashboard');
            break;
          case 'administrador':
          case 'gerente':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/admin/dashboard');
        }
      } else {
        setError(result.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Coffee size={40} color="#E8A830" style={{ marginBottom: '0.5rem' }} />
          <h1>Café Bar</h1>
          <p>Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <h3>Usuarios de prueba:</h3>
          <div className="test-users">
            <div className="test-user">
              <strong>Administrador:</strong> admin@cafebar.com / 123456
            </div>
            <div className="test-user">
              <strong>Gerente:</strong> gerente@cafebar.com / 123456
            </div>
            <div className="test-user">
              <strong>Mesero:</strong> carlos@cafebar.com / 123456
            </div>
            <div className="test-user">
              <strong>Chef:</strong> ana@cafebar.com / 123456
            </div>
            <div className="test-user">
              <strong>Cajero:</strong> cliente@test.com / 123456
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
