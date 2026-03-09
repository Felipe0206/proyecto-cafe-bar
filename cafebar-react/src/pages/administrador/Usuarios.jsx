import { useState, useEffect } from 'react';
import { usuarioService } from '../../services/api';
import './Usuarios.css';

/**
 * Gestión de Usuarios para Administradores
 * Replica funcionalidad de views/administrador/usuarios.html
 * CRUD completo de usuarios
 */
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroRol, setFiltroRol] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente',
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.getAll();
      setUsuarios(response.data.data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const usuariosFiltrados = filtroRol === 'todos'
    ? usuarios
    : usuarios.filter(u => u.rol === filtroRol);

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido || '',
        email: usuario.email,
        password: '',
        telefono: usuario.telefono || '',
        rol: usuario.rol,
        activo: usuario.activo
      });
    } else {
      setUsuarioEditando(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        rol: 'cliente',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (usuarioEditando) {
        await usuarioService.update({
          id: usuarioEditando.idUsuario,
          ...formData
        });
        alert('Usuario actualizado exitosamente');
      } else {
        await usuarioService.create(formData);
        alert('Usuario creado exitosamente');
      }

      setShowModal(false);
      cargarUsuarios();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('Error al guardar usuario');
    }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await usuarioService.delete(id);
      alert('Usuario eliminado');
      cargarUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  return (
    <div className="usuarios-container">
      <header>
        <h1>👥 Gestión de Usuarios</h1>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          + Nuevo Usuario
        </button>
      </header>

      {/* Filtros */}
      <div className="filtros">
        <button
          className={filtroRol === 'todos' ? 'active' : ''}
          onClick={() => setFiltroRol('todos')}
        >
          Todos ({usuarios.length})
        </button>
        <button
          className={filtroRol === 'cliente' ? 'active' : ''}
          onClick={() => setFiltroRol('cliente')}
        >
          Clientes ({usuarios.filter(u => u.rol === 'cliente').length})
        </button>
        <button
          className={filtroRol === 'trabajador' ? 'active' : ''}
          onClick={() => setFiltroRol('trabajador')}
        >
          Trabajadores ({usuarios.filter(u => u.rol === 'trabajador').length})
        </button>
        <button
          className={filtroRol === 'administrador' ? 'active' : ''}
          onClick={() => setFiltroRol('administrador')}
        >
          Administradores ({usuarios.filter(u => u.rol === 'administrador').length})
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(usuario => (
            <tr key={usuario.idUsuario}>
              <td>{usuario.idUsuario}</td>
              <td>{usuario.nombre} {usuario.apellido}</td>
              <td>{usuario.email}</td>
              <td>{usuario.telefono || '-'}</td>
              <td>
                <span className={`badge rol-${usuario.rol}`}>
                  {usuario.rol}
                </span>
              </td>
              <td>
                <span className={`badge ${usuario.activo ? 'success' : 'danger'}`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="acciones">
                <button
                  className="btn-icon btn-editar"
                  onClick={() => abrirModal(usuario)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon btn-eliminar"
                  onClick={() => eliminarUsuario(usuario.idUsuario)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Crear/Editar Usuario */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña {!usuarioEditando && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!usuarioEditando}
                  placeholder={usuarioEditando ? 'Dejar en blanco para no cambiar' : ''}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    required
                  >
                    <option value="cliente">Cliente</option>
                    <option value="trabajador">Trabajador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  {' '}Usuario Activo
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {usuarioEditando ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
