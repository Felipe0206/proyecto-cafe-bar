import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productoService, categoriaService, pedidoService, mesaService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Armchair, ShoppingCart, User, Trash2, UtensilsCrossed, CheckCircle, Clock, ChefHat, Bell, Receipt, X } from 'lucide-react';
import './Menu.css';

const API = 'http://localhost:8080/cafebar/api';

const Menu = () => {
  const { user, login, logout } = useAuth();
  const [searchParams] = useSearchParams();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCarrito, setModalCarrito] = useState(false);
  const [mesaId, setMesaId] = useState(parseInt(searchParams.get('mesa')) || null);
  const [mesas, setMesas] = useState([]);
  const [modalMesa, setModalMesa] = useState(false);

  // Modal de auth (registro / login)
  const [modalAuth, setModalAuth] = useState(false);
  const [authTab, setAuthTab] = useState('registro'); // 'registro' | 'login'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [regForm, setRegForm] = useState({ nombre: '', email: '', telefono: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Acción pendiente después de autenticarse
  const [pendingAction, setPendingAction] = useState(null);

  // Seguimiento de pedido activo
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [showCuenta, setShowCuenta] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, mesasRes] = await Promise.all([
        productoService.getAll(),
        categoriaService.getActivas(),
        mesaService.getAll()
      ]);
      setProductos(prodRes.data.data || []);
      setCategorias(catRes.data.data || []);
      setMesas((mesasRes.data.data || []).filter(m => m.estado === 'disponible'));
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = categoriaActiva === 'todas'
    ? productos.filter(p => p.disponible)
    : productos.filter(p => p.disponible && p.categoriaId === categoriaActiva);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === producto.idProducto);
      if (existe) return prev.map(i => i.id === producto.idProducto ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { id: producto.idProducto, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) setCarrito(prev => prev.filter(i => i.id !== id));
    else setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i));
  };

  const calcularTotal = () => carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);

  const realizarPedido = () => {
    if (carrito.length === 0) { alert('El carrito está vacío'); return; }
    if (!mesaId) { setModalMesa(true); return; }
    enviarPedido();
  };

  const enviarPedido = async (usuarioOverride) => {
    const usuarioActual = usuarioOverride || user;
    const totalPedido = calcularTotal();
    const itemsPedido = [...carrito];
    try {
      const res = await pedidoService.create({
        idMesa: String(parseInt(mesaId)),
        clienteId: usuarioActual?.clienteId ? String(usuarioActual.clienteId) : undefined,
        idUsuario: usuarioActual?.id ? String(usuarioActual.id) : undefined,
        total: String(totalPedido),
        tipoPedido: 'mesa',
        items: itemsPedido.map(i => ({ idProducto: String(i.id), cantidad: String(i.cantidad), precio: String(i.precio) }))
      });
      setCarrito([]);
      setModalCarrito(false);
      const pedidoId = res.data.id;
      const codigo = res.data.codigoPedido;
      setPedidoActivo({ id: pedidoId, codigo, total: totalPedido, items: itemsPedido, estado: 'pendiente' });
      setShowPedidoModal(true);
      // Polling cada 8 segundos para actualizar estado
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        try {
          const r = await pedidoService.getById(pedidoId);
          const estado = r.data.data?.estado || r.data.estado;
          setPedidoActivo(prev => {
            if (!prev) return null;
            if (prev.estado !== 'listo' && estado === 'listo') setShowPedidoModal(true);
            return { ...prev, estado };
          });
          if (estado === 'entregado' || estado === 'cancelado') {
            clearInterval(intervalRef.current);
          }
        } catch (_) {}
      }, 8000);
    } catch (e) {
      console.error(e);
      alert('Error al realizar el pedido. Intente nuevamente.');
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // Registro de nuevo cliente
  const handleRegistro = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regForm.nombre || !regForm.email || !regForm.password) {
      setAuthError('Completa todos los campos requeridos');
      return;
    }
    setAuthLoading(true);
    try {
      // 1. Crear usuario con rol cliente
      const resReg = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: regForm.nombre, email: regForm.email, telefono: regForm.telefono, password: regForm.password, rol: 'cliente' })
      });
      const dataReg = await resReg.json();
      if (!dataReg.success) { setAuthError(dataReg.message || 'Error al registrarse'); return; }

      // 2. Iniciar sesión automáticamente
      const result = await login(regForm.email, regForm.password);
      if (!result.success) { setAuthError('Registro exitoso pero error al iniciar sesión'); return; }

      const usuarioNuevo = JSON.parse(localStorage.getItem('user'));
      setModalAuth(false);
      setAuthError('');

      if (pendingAction === 'pedido') {
        setPendingAction(null);
        await enviarPedido(usuarioNuevo);
      }
    } catch (e) {
      setAuthError('Error de conexión. Intente nuevamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Login de cliente existente
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (!result.success) { setAuthError(result.message || 'Credenciales incorrectas'); return; }

      const usuarioActual = JSON.parse(localStorage.getItem('user'));
      setModalAuth(false);
      setAuthError('');

      if (pendingAction === 'pedido') {
        setPendingAction(null);
        await enviarPedido(usuarioActual);
      }
    } catch (e) {
      setAuthError('Error de conexión. Intente nuevamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando menú...</div>;

  return (
    <div className="menu-container">
      {/* Header del menú */}
      <header className="menu-header">
        <h1><UtensilsCrossed size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Menú Café Bar</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mesa */}
          {mesaId ? (
            <span className="mesa-info" style={{ cursor: 'pointer', background: '#eff6ff', color: '#2563eb', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              onClick={() => setModalMesa(true)}>
              <Armchair size={14} /> Mesa #{mesaId}
            </span>
          ) : (
            <button className="btn btn-secondary" onClick={() => setModalMesa(true)} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Armchair size={14} /> Seleccionar Mesa
            </button>
          )}

          {/* Carrito */}
          <button className="btn-carrito" onClick={() => setModalCarrito(true)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShoppingCart size={18} /> {carrito.length > 0 ? `(${carrito.reduce((t,i)=>t+i.cantidad,0)})` : ''}
          </button>

          {/* Usuario */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {user.nombre}</span>
              {['cliente','cajero'].includes(user.rol) && (
                <Link to="/cliente/pedidos" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}>Mis pedidos</Link>
              )}
              <button onClick={logout} style={{ fontSize: '0.78rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Salir</button>
            </div>
          ) : (
            <button onClick={() => { setAuthTab('login'); setModalAuth(true); }}
              style={{ fontSize: '0.85rem', background: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', padding: '0.3rem 0.75rem', cursor: 'pointer' }}>
              Iniciar sesión
            </button>
          )}
        </div>
      </header>

      {/* Filtro de Categorías */}
      <div className="categorias">
        <button className={categoriaActiva === 'todas' ? 'active' : ''} onClick={() => setCategoriaActiva('todas')}>Todas</button>
        {categorias.map(cat => (
          <button key={cat.idCategoria} className={categoriaActiva === cat.idCategoria ? 'active' : ''} onClick={() => setCategoriaActiva(cat.idCategoria)}>
            {cat.icono && <span className="material-icons" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '4px' }}>{cat.icono}</span>}
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      <div className="productos-grid">
        {productosFiltrados.map(producto => (
          <div key={producto.idProducto} className="producto-card">
            {producto.imagenUrl
              ? <img src={producto.imagenUrl} alt={producto.nombre} className="producto-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              : null}
            <div className="producto-img-placeholder" style={{ display: producto.imagenUrl ? 'none' : 'flex' }}>
              <UtensilsCrossed size={32} color="#C8862A" />
            </div>
            <div className="producto-info">
              <h3>{producto.nombre}</h3>
              {producto.descripcion && <p className="descripcion">{producto.descripcion}</p>}
              <div className="producto-footer">
                <span className="precio">${parseFloat(producto.precio || 0).toLocaleString()}</span>
                <button className="btn-agregar" onClick={() => agregarAlCarrito(producto)}>
                  + Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No hay productos disponibles en esta categoría</div>
      )}

      {/* Botón flotante del carrito */}
      {carrito.length > 0 && (
        <button onClick={() => setModalCarrito(true)} style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: '#2563eb', color: 'white', border: 'none', borderRadius: '50px',
          padding: '0.85rem 1.5rem', fontSize: '1rem', fontWeight: '600',
          boxShadow: '0 4px 15px rgba(37,99,235,0.4)', cursor: 'pointer', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <ShoppingCart size={18} /> Ver pedido ({carrito.reduce((t,i)=>t+i.cantidad,0)}) · ${calcularTotal().toLocaleString()}
        </button>
      )}

      {/* Modal Selección de Mesa */}
      {modalMesa && (
        <div className="modal-overlay" onClick={() => setModalMesa(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Armchair size={20} /> Seleccionar Mesa</h2>
              <button onClick={() => setModalMesa(false)}>✕</button>
            </div>
            <div className="modal-body">
              {mesas.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center' }}>No hay mesas disponibles</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {mesas.map(mesa => (
                    <button key={mesa.idMesa} onClick={() => { setMesaId(mesa.idMesa); setModalMesa(false); }}
                      style={{ padding: '1rem 0.5rem', borderRadius: '8px', border: '2px solid', cursor: 'pointer', textAlign: 'center',
                        borderColor: String(mesaId) === String(mesa.idMesa) ? '#2563eb' : '#e2e8f0',
                        background: String(mesaId) === String(mesa.idMesa) ? '#eff6ff' : 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}><Armchair size={24} /></div>
                      <div style={{ fontWeight: 'bold' }}>Mesa {mesa.numeroMesa}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{mesa.capacidad} pers.</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Carrito */}
      {modalCarrito && (
        <div className="modal-overlay" onClick={() => setModalCarrito(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={20} /> Tu Pedido {mesaId ? `— Mesa #${mesaId}` : ''}</h2>
              <button onClick={() => setModalCarrito(false)}>✕</button>
            </div>
            <div className="modal-body">
              {carrito.length === 0 ? (
                <p className="carrito-vacio">El carrito está vacío</p>
              ) : (
                <>
                  {carrito.map(item => (
                    <div key={item.id} className="carrito-item">
                      <div className="item-info">
                        <h4>{item.nombre}</h4>
                        <p>${parseFloat(item.precio).toLocaleString()}</p>
                      </div>
                      <div className="item-cantidad">
                        <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                      </div>
                      <div className="item-subtotal">${(item.precio * item.cantidad).toLocaleString()}</div>
                      <button className="btn-eliminar" onClick={() => actualizarCantidad(item.id, 0)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <div className="carrito-total">
                    <strong>Total:</strong>
                    <strong>${calcularTotal().toLocaleString()}</strong>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalCarrito(false)}>Seguir viendo</button>
              <button className="btn btn-primary" onClick={realizarPedido} disabled={carrito.length === 0}>
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Auth: Registro / Login */}
      {modalAuth && (
        <div className="modal-overlay" onClick={() => { setModalAuth(false); setAuthError(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
              {[['registro','Registrarse'],['login','Ya tengo cuenta']].map(([tab, label]) => (
                <button key={tab} onClick={() => { setAuthTab(tab); setAuthError(''); }}
                  style={{ flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: authTab === tab ? '700' : '400',
                    background: 'none', borderBottom: authTab === tab ? '2px solid #2563eb' : 'none',
                    color: authTab === tab ? '#2563eb' : '#6b7280', marginBottom: '-2px' }}>
                  {label}
                </button>
              ))}
              <button onClick={() => { setModalAuth(false); setAuthError(''); }}
                style={{ padding: '0.75rem', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem' }}>✕</button>
            </div>

            {authError && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
                {authError}
              </div>
            )}

            {authTab === 'registro' ? (
              <form onSubmit={handleRegistro}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Nombre completo *</label>
                  <input type="text" required value={regForm.nombre} onChange={e => setRegForm({...regForm, nombre: e.target.value})}
                    placeholder="Tu nombre" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Correo electrónico *</label>
                  <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})}
                    placeholder="correo@ejemplo.com" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Teléfono (opcional)</label>
                  <input type="tel" value={regForm.telefono} onChange={e => setRegForm({...regForm, telefono: e.target.value})}
                    placeholder="300 000 0000" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Contraseña *</label>
                  <input type="password" required minLength={4} value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})}
                    placeholder="Mínimo 4 caracteres" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                  {authLoading ? 'Registrando...' : 'Registrarme y Pedir'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: '#6b7280' }}>
                  Al registrarte aceptas los términos del servicio
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Correo electrónico</label>
                  <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                    placeholder="correo@ejemplo.com" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Contraseña</label>
                  <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    placeholder="••••••••" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                  {authLoading ? 'Ingresando...' : 'Ingresar y Pedir'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal seguimiento de pedido */}
      {pedidoActivo && showPedidoModal && (() => {
        const PASOS = [
          { key: 'pendiente',      label: 'Recibido',   icon: Clock },
          { key: 'en_preparacion', label: 'Preparando', icon: ChefHat },
          { key: 'listo',          label: 'Listo',      icon: Bell },
          { key: 'entregado',      label: 'Entregado',  icon: CheckCircle },
        ];
        const ORDEN = PASOS.map(p => p.key);
        const idxActual = ORDEN.indexOf(pedidoActivo.estado);
        const INFO = {
          pendiente:      { color: '#E8A830', bg: 'linear-gradient(135deg,#1C1008,#3A2010)', msg: '¡Pedido recibido!',    sub: 'Tu pedido llegó a cocina, pronto empezamos.' },
          en_preparacion: { color: '#3498db', bg: 'linear-gradient(135deg,#1a3a5c,#2563eb)', msg: 'Estamos preparándolo', sub: 'Nuestro equipo trabaja en tu pedido.' },
          listo:          { color: '#27ae60', bg: 'linear-gradient(135deg,#064e3b,#059669)', msg: '¡Listo para servir!',  sub: 'Tu pedido va en camino a tu mesa.' },
          entregado:      { color: '#C8862A', bg: 'linear-gradient(135deg,#1C1008,#C8862A)', msg: '¡Buen provecho!',     sub: 'Gracias por tu visita. ¡Disfrútalo!' },
        };
        const info = INFO[pedidoActivo.estado] || INFO.pendiente;
        const IconoPrincipal = PASOS.find(p => p.key === pedidoActivo.estado)?.icon || Clock;
        return (
          <div className="seguimiento-overlay">
            <div className="seguimiento-modal">
              {/* Cabecera con gradiente */}
              <div className="seguimiento-header" style={{ background: info.bg }}>
                <div className="seguimiento-icon-wrap">
                  <IconoPrincipal size={44} color="white" strokeWidth={1.5} />
                </div>
                <h2 className="seguimiento-titulo">{info.msg}</h2>
                <p className="seguimiento-subtitulo">{info.sub}</p>
                <div className="seguimiento-codigo">
                  Pedido #{pedidoActivo.codigo} · Mesa {mesaId}
                </div>
              </div>

              <div className="seguimiento-body">
                {/* Stepper */}
                <div className="seguimiento-stepper">
                  {PASOS.map((paso, idx) => {
                    const Icono = paso.icon;
                    const completado = idx < idxActual;
                    const activo    = idx === idxActual;
                    return (
                      <div key={paso.key} className="seguimiento-step-wrap">
                        <div className={`seguimiento-step ${completado ? 'completado' : activo ? 'activo' : ''}`}>
                          <Icono size={16} />
                        </div>
                        <span className={`seguimiento-step-label ${activo ? 'activo' : completado ? 'completado' : ''}`}>
                          {paso.label}
                        </span>
                        {idx < PASOS.length - 1 && (
                          <div className={`seguimiento-linea ${completado ? 'completado' : ''}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="seguimiento-items">
                  {pedidoActivo.items.map((item, i) => (
                    <div key={i} className="seguimiento-item">
                      <span className="seguimiento-item-qty">{item.cantidad}×</span>
                      <span className="seguimiento-item-nombre">{item.nombre}</span>
                      <span className="seguimiento-item-precio">${(item.precio * item.cantidad).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="seguimiento-total">
                    <span>Total</span>
                    <span>${pedidoActivo.total.toLocaleString()}</span>
                  </div>
                </div>

                {pedidoActivo.estado === 'listo' && (
                  <div className="seguimiento-alerta-listo">
                    <Bell size={18} />
                    ¡Tu pedido va en camino! El mesero lo llevará a tu mesa.
                  </div>
                )}

                {pedidoActivo.estado !== 'entregado' && pedidoActivo.estado !== 'cancelado' && (
                  <p className="seguimiento-hint">Actualizando automáticamente cada 8 segundos</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(pedidoActivo.estado === 'listo' || pedidoActivo.estado === 'entregado') && (
                    <button className="cuenta-btn-ver"
                      onClick={() => { setShowCuenta(true); setShowPedidoModal(false); }}>
                      <Receipt size={17} /> Ver mi cuenta
                    </button>
                  )}
                  {(pedidoActivo.estado === 'entregado' || pedidoActivo.estado === 'cancelado') ? (
                    <button className="seguimiento-btn-cerrar"
                      onClick={() => { setPedidoActivo(null); setShowPedidoModal(false); }}>
                      Volver al menú
                    </button>
                  ) : (
                    <button className="seguimiento-btn-cerrar"
                      onClick={() => setShowPedidoModal(false)}>
                      Seguir viendo el menú
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal cuenta */}
      {showCuenta && pedidoActivo && (
        <div className="seguimiento-overlay">
          <div className="cuenta-modal">
            <button className="cuenta-close" onClick={() => { setShowCuenta(false); setShowPedidoModal(true); }}>
              <X size={18} />
            </button>

            {/* Encabezado estilo ticket */}
            <div className="cuenta-header">
              <div className="cuenta-logo">
                <UtensilsCrossed size={28} color="#C8862A" />
              </div>
              <h2>Café Bar</h2>
              <p>Mesa {mesaId}</p>
              <div className="cuenta-divider-dots" />
            </div>

            <div className="cuenta-body">
              <div className="cuenta-info-row">
                <span>Pedido</span><span>#{pedidoActivo.codigo}</span>
              </div>
              <div className="cuenta-info-row">
                <span>Fecha</span><span>{new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })}</span>
              </div>
              <div className="cuenta-info-row">
                <span>Hora</span><span>{new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })}</span>
              </div>

              <div className="cuenta-divider" />

              <div className="cuenta-items-header">
                <span>Producto</span><span>Cant.</span><span>Valor</span>
              </div>
              {pedidoActivo.items.map((item, i) => (
                <div key={i} className="cuenta-item-row">
                  <span className="cuenta-item-nombre">{item.nombre}</span>
                  <span className="cuenta-item-cant">{item.cantidad}</span>
                  <span className="cuenta-item-val">${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
              ))}

              <div className="cuenta-divider" />

              <div className="cuenta-subtotal-row">
                <span>Subtotal</span>
                <span>${pedidoActivo.total.toLocaleString()}</span>
              </div>
              <div className="cuenta-subtotal-row" style={{ color: '#888', fontSize: '0.82rem' }}>
                <span>IVA incluido</span>
                <span>—</span>
              </div>

              <div className="cuenta-total-row">
                <span>TOTAL</span>
                <span>${pedidoActivo.total.toLocaleString()}</span>
              </div>

              <div className="cuenta-divider-dots" style={{ margin: '1.25rem 0 1rem' }} />

              <p className="cuenta-gracias">¡Gracias por tu visita!</p>
              <p className="cuenta-hint">Solicita el pago al mesero</p>

              <button className="cuenta-btn-volver"
                onClick={() => {
                  setShowCuenta(false);
                  if (pedidoActivo.estado !== 'entregado') setShowPedidoModal(true);
                }}>
                {pedidoActivo.estado === 'entregado' ? 'Cerrar' : 'Volver al pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante cuando hay pedido activo y modales cerrados */}
      {pedidoActivo && !showPedidoModal && !showCuenta && (() => {
        if (pedidoActivo.estado === 'entregado') {
          return (
            <button className="seguimiento-fab" onClick={() => setShowCuenta(true)}
              style={{ background: 'linear-gradient(135deg,#1C1008,#C8862A)' }}>
              <Receipt size={18} />
              <span>Ver mi cuenta</span>
            </button>
          );
        }
        const colores = { listo: '#27ae60', en_preparacion: '#2563eb', pendiente: '#C8862A' };
        const Icono = pedidoActivo.estado === 'listo' ? Bell : pedidoActivo.estado === 'en_preparacion' ? ChefHat : Clock;
        const labels = { listo: '¡Tu pedido está listo!', en_preparacion: 'En preparación…', pendiente: 'Ver mi pedido' };
        return (
          <button className="seguimiento-fab" onClick={() => setShowPedidoModal(true)}
            style={{ background: colores[pedidoActivo.estado] || '#C8862A' }}>
            <Icono size={18} />
            <span>{labels[pedidoActivo.estado] || 'Ver mi pedido'}</span>
          </button>
        );
      })()}
    </div>
  );
};

export default Menu;
