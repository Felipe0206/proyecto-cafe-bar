import { useEffect, useRef, useState, useCallback } from 'react';
import { mesaService, pedidoService } from '../../services/api';
import { RefreshCw, RotateCcw, Map } from 'lucide-react';
import '../modulos.css';

// ── Paleta de colores por estado ────────────────────────────────────────────
const COLORS = {
  disponible:    { table: '#d1fae5', border: '#27ae60', text: '#065f46' },
  ocupada:       { table: '#fee2e2', border: '#e74c3c', text: '#7f1d1d' },
  reservada:     { table: '#FDF3E0', border: '#E8A830', text: '#7A5010' },
  mantenimiento: { table: '#F0F0F0', border: '#888888', text: '#555555' },
};

const ESTADOS_LABEL = {
  disponible: 'Disponible', ocupada: 'Ocupada',
  reservada: 'Reservada',   mantenimiento: 'Mantenimiento',
};

const ESTADO_TRANSICIONES = {
  disponible:    ['ocupada', 'reservada', 'mantenimiento'],
  ocupada:       ['disponible'],
  reservada:     ['disponible', 'ocupada'],
  mantenimiento: ['disponible'],
};

// ── Dimensiones ───────────────────────────────────────────────────────────────
const TW = 84;
const TH = 64;
const CR = 9;
const CG = 7;
const STORAGE_KEY = 'cafebar_plano_v1';
const COLS = 4;
const CELL_W = 175;
const CELL_H = 155;
const PAD = 85;

function defaultLayout(mesas) {
  const pos = {};
  mesas.forEach((m, i) => {
    pos[m.idMesa] = { x: PAD + (i % COLS) * CELL_W, y: PAD + Math.floor(i / COLS) * CELL_H };
  });
  return pos;
}

function chairPositions(cx, cy, cap) {
  const rx = TW / 2 + CG + CR;
  const ry = TH / 2 + CG + CR;
  return Array.from({ length: cap }, (_, i) => {
    const angle = (i / cap) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ── Renderizado del canvas ────────────────────────────────────────────────────
function renderCanvas(canvas, mesas, posRef, pedidosRef, selectedId, draggingId, timestamp) {
  if (!canvas || !mesas.length) return;
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);

  // Fondo + grid
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#ede9e4';
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 0; y <= height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

  // Borde del local
  ctx.strokeStyle = '#C8862A';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.setLineDash([]);

  ctx.fillStyle = '#C8862A';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.5;
  ctx.fillText('PLANO DEL LOCAL', 28, 28);
  ctx.globalAlpha = 1;

  // Pulso para mesas con pedido "listo"
  const pulse = (Math.sin(timestamp / 350) + 1) / 2; // 0..1

  mesas.forEach(mesa => {
    const pos = posRef.current[mesa.idMesa];
    if (!pos) return;
    const { x: cx, y: cy } = pos;
    const estado = mesa.estado || 'disponible';
    const c = COLORS[estado] || COLORS.disponible;
    const cap = Math.max(1, parseInt(mesa.capacidad) || 2);
    const isSel  = mesa.idMesa === selectedId;
    const isDrag = mesa.idMesa === draggingId;

    const pedidos    = pedidosRef.current[mesa.idMesa] || [];
    const hayListo   = pedidos.some(p => p.estado === 'listo');
    const totalActivos = pedidos.length;

    ctx.save();

    // Halo de alerta para pedido listo
    if (hayListo) {
      const glow = 10 + pulse * 18;
      ctx.shadowColor = '#E8A830';
      ctx.shadowBlur  = glow;
    } else if (isDrag) {
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur  = 24;
      ctx.shadowOffsetY = 8;
    } else if (isSel) {
      ctx.shadowColor = c.border;
      ctx.shadowBlur  = 14;
    }

    // Sillas
    chairPositions(cx, cy, cap).forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, CR, 0, Math.PI * 2);
      ctx.fillStyle   = c.table;
      ctx.fill();
      ctx.strokeStyle = c.border;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    });

    // Mesa
    roundRect(ctx, cx - TW / 2, cy - TH / 2, TW, TH, 10);
    ctx.fillStyle   = c.table;
    ctx.fill();
    ctx.strokeStyle = isSel ? '#C8862A' : (hayListo ? `rgba(232,168,48,${0.6 + pulse * 0.4})` : c.border);
    ctx.lineWidth   = (isSel || hayListo) ? 3 : 2;
    ctx.stroke();

    ctx.restore();

    // Texto: número
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = c.text;
    ctx.font         = `bold ${isSel ? '15px' : '14px'} system-ui, sans-serif`;
    ctx.fillText(`Mesa ${mesa.numeroMesa}`, cx, cy - 10);

    // Texto: sillas
    ctx.font         = '11px system-ui, sans-serif';
    ctx.globalAlpha  = 0.65;
    ctx.fillText(`${cap} sillas`, cx, cy + 9);
    ctx.globalAlpha  = 1;

    // Badge: pedidos activos
    if (totalActivos > 0) {
      const bx = cx + TW / 2 - 1;
      const by = cy - TH / 2 + 1;
      const br = 10;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = hayListo ? '#E8A830' : '#e74c3c';
      ctx.fill();
      ctx.fillStyle    = 'white';
      ctx.font         = 'bold 10px system-ui, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(totalActivos), bx, by);
    }

    // Indicador "LISTO" animado
    if (hayListo) {
      ctx.globalAlpha  = 0.5 + pulse * 0.5;
      ctx.fillStyle    = '#E8A830';
      ctx.font         = 'bold 9px system-ui, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('● LISTO', cx, cy + TH / 2 + CG + CR * 2 + 6);
      ctx.globalAlpha  = 1;
    }
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
const PlanoCafeteria = () => {
  const canvasRef   = useRef(null);
  const posRef      = useRef({});
  const mesasRef    = useRef([]);
  const pedidosRef  = useRef({});
  const selectedRef = useRef(null);
  const draggingRef = useRef(null);
  const animRef     = useRef(null);

  const [mesas,        setMesas]        = useState([]);
  const [pedidosPorMesa, setPedidosPorMesa] = useState({});
  const [selected,     setSelected]     = useState(null);
  const [dragging,     setDragging]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [, forceUpdate] = useState(0);

  // ── Loop de animación ───────────────────────────────────────────────────────
  const startAnimation = useCallback(() => {
    const loop = (timestamp) => {
      renderCanvas(
        canvasRef.current,
        mesasRef.current,
        posRef,
        pedidosRef,
        selectedRef.current,
        draggingRef.current?.idMesa ?? null,
        timestamp
      );
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    startAnimation();
    return () => cancelAnimationFrame(animRef.current);
  }, [startAnimation]);

  // ── Carga de datos ──────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    try {
      const [mesasRes, pedidosRes] = await Promise.all([
        mesaService.getAll(),
        pedidoService.getAll(),
      ]);
      const data    = mesasRes.data.data  || [];
      const pedidos = pedidosRes.data.data || [];

      // Agrupar pedidos activos por mesa
      const activos = {};
      pedidos
        .filter(p => ['pendiente', 'en_preparacion', 'listo'].includes(p.estado))
        .forEach(p => {
          if (!activos[p.idMesa]) activos[p.idMesa] = [];
          activos[p.idMesa].push(p);
        });

      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch {}

      const pos = defaultLayout(data);
      data.forEach(m => { if (saved[m.idMesa]) pos[m.idMesa] = saved[m.idMesa]; });

      posRef.current    = pos;
      mesasRef.current  = data;
      pedidosRef.current = activos;
      setMesas(data);
      setPedidosPorMesa(activos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  useEffect(() => {
    mesasRef.current   = mesas;
    pedidosRef.current = pedidosPorMesa;
    selectedRef.current = selected;
    draggingRef.current = dragging;
  }, [mesas, pedidosPorMesa, selected, dragging]);

  // ── Cambiar estado de mesa ──────────────────────────────────────────────────
  const cambiarEstado = async (mesa, nuevoEstado) => {
    setGuardando(true);
    try {
      await mesaService.update({
        idMesa:    String(mesa.idMesa),
        estado:    nuevoEstado,
        capacidad: String(mesa.capacidad),
        ubicacion: mesa.ubicacion,
      });
      await cargarDatos();
      // Actualiza el selected con los nuevos datos
      setSelected(mesa.idMesa);
    } catch {
      alert('Error al actualizar el estado');
    } finally {
      setGuardando(false);
    }
  };

  // ── Hit testing ─────────────────────────────────────────────────────────────
  const getTableAt = useCallback((x, y) => {
    const hx = TW / 2 + CR + CG + 6;
    const hy = TH / 2 + CR + CG + 6;
    for (let i = mesasRef.current.length - 1; i >= 0; i--) {
      const m   = mesasRef.current[i];
      const pos = posRef.current[m.idMesa];
      if (!pos) continue;
      if (x >= pos.x - hx && x <= pos.x + hx && y >= pos.y - hy && y <= pos.y + hy) return m;
    }
    return null;
  }, []);

  // ── Eventos mouse ───────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mesa = getTableAt(x, y);
    if (mesa) {
      const pos  = posRef.current[mesa.idMesa];
      const drag = { idMesa: mesa.idMesa, offX: x - pos.x, offY: y - pos.y };
      draggingRef.current = drag;
      selectedRef.current = mesa.idMesa;
      setDragging(drag);
      setSelected(mesa.idMesa);
    } else {
      selectedRef.current = null;
      setSelected(null);
    }
  }, [getTableAt]);

  const onMouseMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    posRef.current = {
      ...posRef.current,
      [draggingRef.current.idMesa]: {
        x: e.clientX - rect.left - draggingRef.current.offX,
        y: e.clientY - rect.top  - draggingRef.current.offY,
      },
    };
  }, []);

  const onMouseUp = useCallback(() => {
    if (draggingRef.current) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current)); } catch {}
      draggingRef.current = null;
      setDragging(null);
      forceUpdate(n => n + 1);
    }
  }, []);

  const resetLayout = () => {
    const pos = defaultLayout(mesasRef.current);
    posRef.current = pos;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch {}
    forceUpdate(n => n + 1);
  };

  // ── Mesa seleccionada (datos frescos) ───────────────────────────────────────
  const mesaSeleccionada = mesas.find(m => m.idMesa === selected);
  const pedidosMesaSel   = mesaSeleccionada ? (pedidosPorMesa[mesaSeleccionada.idMesa] || []) : [];

  if (loading) return <div className="modulo-loading">Cargando plano...</div>;

  return (
    <div>
      <div className="modulo-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Map size={22} color="#C8862A" /> Plano del Local
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#aaa' }}>Auto-refresh 30s</span>
          <button onClick={resetLayout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={14} /> Reorganizar
          </button>
          <button onClick={cargarDatos} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(COLORS).map(([estado, c]) => (
          <div key={estado} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: c.table, border: `2px solid ${c.border}` }} />
            <span style={{ textTransform: 'capitalize', color: '#555' }}>{estado}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#E8A830', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '8px', fontWeight: 'bold' }}>!</span>
          </div>
          <span style={{ color: '#555' }}>Pedido listo</span>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' }}>
          Arrastra para mover · Clic para gestionar
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'auto', borderRadius: '12px', border: '1px solid #e8e4df', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <canvas
            ref={canvasRef}
            width={780}
            height={Math.max(520, Math.ceil(mesas.length / COLS) * CELL_H + PAD * 2)}
            style={{ display: 'block', cursor: dragging ? 'grabbing' : 'grab' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>

        {/* Panel lateral */}
        {mesaSeleccionada && (
          <div style={{ width: '210px', flexShrink: 0, background: 'white', border: '1px solid #e8e4df', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#1C1008', fontSize: '1.1rem', borderBottom: '2px solid #F7F3EE', paddingBottom: '0.6rem' }}>
              Mesa {mesaSeleccionada.numeroMesa}
            </h3>

            {/* Info básica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#555', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '2px' }}>CAPACIDAD</div>
                <div style={{ fontWeight: '600' }}>{mesaSeleccionada.capacidad} personas</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '2px' }}>UBICACIÓN</div>
                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{mesaSeleccionada.ubicacion}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '4px' }}>ESTADO ACTUAL</div>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                  background: (COLORS[mesaSeleccionada.estado]?.border || '#888') + '22',
                  color: COLORS[mesaSeleccionada.estado]?.border || '#888',
                  fontWeight: '600', fontSize: '0.82rem', textTransform: 'capitalize',
                }}>
                  {ESTADOS_LABEL[mesaSeleccionada.estado] || mesaSeleccionada.estado}
                </span>
              </div>
            </div>

            {/* Pedidos activos */}
            {pedidosMesaSel.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '6px' }}>PEDIDOS ACTIVOS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {pedidosMesaSel.map(p => (
                    <div key={p.idPedido} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem',
                      background: p.estado === 'listo' ? '#FDF3E0' : '#f9f9f9',
                      border: `1px solid ${p.estado === 'listo' ? '#E8A830' : '#eee'}`,
                    }}>
                      <span style={{ fontWeight: '600' }}>#{p.codigoPedido || p.idPedido}</span>
                      <span style={{
                        color: p.estado === 'listo' ? '#E8A830' : p.estado === 'en_preparacion' ? '#3498db' : '#888',
                        fontWeight: '600', textTransform: 'capitalize', fontSize: '0.75rem',
                      }}>
                        {p.estado === 'en_preparacion' ? 'preparando' : p.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cambiar estado */}
            <div>
              <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '6px' }}>CAMBIAR ESTADO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(ESTADO_TRANSICIONES[mesaSeleccionada.estado] || []).map(nuevoEstado => (
                  <button
                    key={nuevoEstado}
                    onClick={() => cambiarEstado(mesaSeleccionada, nuevoEstado)}
                    disabled={guardando}
                    style={{
                      padding: '6px 10px', borderRadius: '6px', border: `1.5px solid ${COLORS[nuevoEstado]?.border || '#888'}`,
                      background: (COLORS[nuevoEstado]?.border || '#888') + '15',
                      color: COLORS[nuevoEstado]?.border || '#888',
                      fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer',
                      textTransform: 'capitalize', opacity: guardando ? 0.5 : 1,
                    }}
                  >
                    → {ESTADOS_LABEL[nuevoEstado]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sillas miniatura */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: '6px' }}>SILLAS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {Array.from({ length: parseInt(mesaSeleccionada.capacidad) || 0 }).map((_, i) => (
                  <div key={i} style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: (COLORS[mesaSeleccionada.estado]?.border || '#888') + '25',
                    border: `1.5px solid ${COLORS[mesaSeleccionada.estado]?.border || '#888'}`,
                  }} />
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              style={{ marginTop: '1rem', width: '100%', background: '#F7F3EE', border: 'none', borderRadius: '6px', padding: '0.45rem', fontSize: '0.82rem', cursor: 'pointer', color: '#888' }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(COLORS).map(([estado, c]) => {
          const count = mesas.filter(m => m.estado === estado).length;
          if (!count) return null;
          return (
            <div key={estado} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: c.table, border: `1px solid ${c.border}`, borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
              <strong style={{ color: c.border, fontSize: '1.1rem' }}>{count}</strong>
              <span style={{ color: c.text, textTransform: 'capitalize' }}>{estado}</span>
            </div>
          );
        })}
        {Object.values(pedidosPorMesa).flat().some(p => p.estado === 'listo') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FDF3E0', border: '1px solid #E8A830', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.85rem', animation: 'none' }}>
            <strong style={{ color: '#E8A830', fontSize: '1.1rem' }}>
              {Object.values(pedidosPorMesa).flat().filter(p => p.estado === 'listo').length}
            </strong>
            <span style={{ color: '#7A5010' }}>pedidos listos para entregar</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanoCafeteria;
