import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { api, assetUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

const FUENTES_TEXTO = [
  { value: 'Inter, Arial, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times' },
  { value: '"Courier New", monospace', label: 'Courier' },
  { value: '"Fugaz One", Inter, sans-serif', label: 'Fugaz One' },
];

export default function Catalogo() {
  const { isAuthenticated, token, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');
  const [editorUid, setEditorUid] = useState('');

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const productoActivo = useMemo(() => {
    const id = Number(searchParams.get('producto'));
    return productos.find((producto) => producto.id_producto === id) || productos[0] || null;
  }, [productos, searchParams]);

  const filtrados = productos.filter((producto) => {
    const texto = `${producto.nombre} ${producto.tipo_tela || ''}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const total = carrito.reduce((suma, item) => suma + item.precio_unitario * item.cantidad, 0);
  const itemEnEdicion = carrito.find((item) => item.uid === editorUid) || null;

  async function cargarCatalogo() {
    try {
      setEstado('cargando');
      const data = await api.get('/catalogo');
      setProductos(data.productos || []);
      setEstado('listo');
    } catch (err) {
      setMensaje(err.message);
      setEstado('error');
    }
  }

  function seleccionarProducto(producto) {
    setSearchParams({ producto: producto.id_producto });
  }

  function agregar(producto, variante) {
    setCarrito([
      {
        uid: `${variante.id_variante}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        id_variante: variante.id_variante,
        producto: producto.nombre,
        producto_imagen: assetUrl(producto.imagen_absoluta || producto.imagen_url),
        color: variante.color,
        talla: variante.talla,
        cantidad: 1,
        precio_unitario: Number(producto.precio_base || 0),
        personalizacion: crearPersonalizacionInicial(),
      },
    ]);
  }

  function cambiarItem(uid, cambios) {
    setCarrito((actual) => actual
      .map((item) => item.uid === uid ? { ...item, ...cambios } : item)
      .filter((item) => item.cantidad > 0));
  }

  function cambiarPersonalizacion(uid, campo, valor) {
    setCarrito((actual) => actual.map((item) => item.uid === uid
      ? { ...item, personalizacion: { ...item.personalizacion, [campo]: valor } }
      : item));
  }

  function agregarImagenPersonalizacion(uid, archivo) {
    if (!archivo) return;
    const nuevaImagen = crearImagenPersonalizacion(archivo);
    setCarrito((actual) => actual.map((item) => {
      if (item.uid !== uid) return item;
      return {
        ...item,
        personalizacion: {
          ...item.personalizacion,
          imagenes: [...item.personalizacion.imagenes, nuevaImagen],
          imagen_activa: nuevaImagen.id,
        },
      };
    }));
  }

  function cambiarImagenPersonalizacion(uid, imagenId, campo, valor) {
    setCarrito((actual) => actual.map((item) => {
      if (item.uid !== uid) return item;
      return {
        ...item,
        personalizacion: {
          ...item.personalizacion,
          imagenes: item.personalizacion.imagenes.map((imagen) => (
            imagen.id === imagenId ? { ...imagen, [campo]: valor } : imagen
          )),
        },
      };
    }));
  }

  function quitarImagenPersonalizacion(uid, imagenId) {
    setCarrito((actual) => actual.map((item) => {
      if (item.uid !== uid) return item;
      const imagenes = item.personalizacion.imagenes.filter((imagen) => imagen.id !== imagenId);
      return {
        ...item,
        personalizacion: {
          ...item.personalizacion,
          imagenes,
          imagen_activa: imagenes[0]?.id || '',
        },
      };
    }));
  }

  function agregarTextoPersonalizacion(uid) {
    const nuevoTexto = crearTextoPersonalizacion();
    setCarrito((actual) => actual.map((item) => {
      if (item.uid !== uid) return item;
      return {
        ...item,
        personalizacion: {
          ...item.personalizacion,
          textos: [
            ...item.personalizacion.textos,
            nuevoTexto,
          ],
          texto_activo: nuevoTexto.id,
        },
      };
    }));
  }

  function cambiarTextoPersonalizacion(uid, textoId, campo, valor) {
    setCarrito((actual) => actual.map((item) => {
      if (item.uid !== uid) return item;
      return {
        ...item,
        personalizacion: {
          ...item.personalizacion,
          textos: item.personalizacion.textos.map((texto) => (
            texto.id === textoId ? { ...texto, [campo]: valor } : texto
          )),
        },
      };
    }));
  }

  function quitarTextoPersonalizacion(uid, textoId) {
    setCarrito((actual) => actual.map((item) => {
      if (item.uid !== uid) return item;
      const textos = item.personalizacion.textos.filter((texto) => texto.id !== textoId);
      const textosFinales = textos.length ? textos : [crearTextoPersonalizacion()];
      return {
        ...item,
        personalizacion: {
          ...item.personalizacion,
          textos: textosFinales,
          texto_activo: textosFinales[0].id,
        },
      };
    }));
  }

  async function confirmarPedido() {
    setMensaje('');
    if (!isAuthenticated) {
      setMensaje('Inicia sesion para confirmar tu pedido.');
      return;
    }
    if (!carrito.length) {
      setMensaje('Agrega al menos una variante al pedido.');
      return;
    }

    try {
      setProcesandoPago(true);
      const detalles = await Promise.all(carrito.map(async (item) => {
        const personalizacion = await prepararPersonalizacion(item, token);
        let idPersonalizacion;

        if (personalizacion) {
          const creada = await api.post('/personalizaciones', personalizacion, token);
          idPersonalizacion = creada.id_personalizacion;
        }

        return {
          id_variante: item.id_variante,
          id_personalizacion: idPersonalizacion,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        };
      }));

      const pedido = await api.post('/pedidos', {
        direccion_envio: direccion || undefined,
        notas: notas || undefined,
        detalles,
      }, token);

      const preferencia = await api.post('/pagos/mercadopago/preferencia', {
        id_pedido: pedido.id_pedido,
      }, token);

      const checkoutUrl = preferencia.init_point || preferencia.sandbox_init_point;
      if (!checkoutUrl) {
        throw new Error('Mercado Pago no devolvio una URL de checkout');
      }

      localStorage.setItem('pedidoPendientePago', String(pedido.id_pedido));
      window.location.href = checkoutUrl;
    } catch (err) {
      setMensaje(err.message);
      setProcesandoPago(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <Link className="brand" to="/">YIZER</Link>
        <nav className="navlinks">
          <Link to="/catalogo"><Icon name="bag" />Catalogo</Link>
          {isAuthenticated ? <Link to="/dashboard"><Icon name="user" />Mi cuenta</Link> : <Link to="/login"><Icon name="login" />Entrar</Link>}
          {isAuthenticated && <button className="link-button" onClick={logout}><Icon name="logout" />Salir</button>}
        </nav>
      </header>

      <section className="catalog-layout">
        <aside className="sidebar">
          <div className="section-head compact">
            <div>
              <p className="eyebrow">Catalogo</p>
              <h1>Productos</h1>
            </div>
          </div>
          <label className="search-field">
            <Icon name="search" />
            <input
              className="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre o tela"
            />
          </label>
          <div className="list">
            {filtrados.map((producto) => (
              <button
                className={`list-item ${productoActivo?.id_producto === producto.id_producto ? 'selected' : ''}`}
                key={producto.id_producto}
                onClick={() => seleccionarProducto(producto)}
              >
                <span className="list-item-main">
                  <span>{producto.nombre}</span>
                  <strong>${Number(producto.precio_base || 0).toFixed(2)}</strong>
                </span>
                <span className="list-preview">
                  <span className="list-preview-image">
                    {producto.imagen_url ? (
                      <img
                        src={assetUrl(producto.imagen_absoluta || producto.imagen_url)}
                        alt={producto.nombre}
                      />
                    ) : (
                      <span>Yizer</span>
                    )}
                  </span>
                  <span className="list-preview-info">
                    <span>{producto.tipo_tela || 'Prenda personalizable'}</span>
                    <small>{producto.variantes?.length || 0} variantes disponibles</small>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="product-detail">
          {estado === 'cargando' && <p className="muted">Cargando catalogo...</p>}
          {estado === 'error' && <p className="notice error">{mensaje}</p>}
          {estado === 'listo' && productoActivo && (
            <>
              <div className="detail-hero">
                <div className="detail-image">
                  {productoActivo.imagen_url ? (
                    <img src={assetUrl(productoActivo.imagen_absoluta || productoActivo.imagen_url)} alt={productoActivo.nombre} />
                  ) : (
                    <span>Yizer</span>
                  )}
                </div>
                <div>
                  <p className="eyebrow">{productoActivo.tipo_tela || 'Prenda personalizable'}</p>
                  <h2>{productoActivo.nombre}</h2>
                  <p className="price">${Number(productoActivo.precio_base || 0).toFixed(2)}</p>
                  <p className="muted">{productoActivo.variantes?.length || 0} variantes activas disponibles.</p>
                </div>
              </div>

              <div className="variant-grid">
                {productoActivo.variantes?.map((variante) => (
                  <article className="variant-card" key={variante.id_variante}>
                    <div>
                      <strong>{variante.color}</strong>
                      <span>Talla {variante.talla}</span>
                    </div>
                    <small>Stock: {variante.stock}</small>
                    <button
                      className="button secondary"
                      disabled={variante.stock <= 0}
                      onClick={() => agregar(productoActivo, variante)}
                    >
                      <Icon name="plus" />
                      Seleccionar
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="cart panel">
          <h2>Pedido</h2>
          {mensaje && <p className={`notice ${mensaje.includes('creado') ? 'success' : 'error'}`}>{mensaje}</p>}
          {!carrito.length ? (
            <p className="muted">Selecciona una variante del catalogo para formar tu pedido.</p>
          ) : (
            <div className="cart-items">
              {carrito.map((item) => (
                <article className="cart-item" key={item.uid}>
                  <div className="cart-item-head">
                    <div>
                      <strong>{item.producto}</strong>
                      <span>{item.color} / {item.talla}</span>
                    </div>
                    <button className="link-button" onClick={() => cambiarItem(item.uid, { cantidad: 0 })}>
                      <Icon name="trash" />
                      Quitar
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={item.cantidad}
                    onChange={(event) => cambiarItem(item.uid, { cantidad: Number(event.target.value) })}
                  />
                  <div className="cart-preview-box">
                    <PersonalizationPreview
                      item={item}
                      editable={false}
                    />
                    <button className="button secondary full" type="button" onClick={() => setEditorUid(item.uid)}>
                      <Icon name="shirt" />
                      Personalizar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <label>
            Direccion de envio
            <textarea value={direccion} onChange={(event) => setDireccion(event.target.value)} rows="3" />
          </label>
          <label>
            Notas
            <textarea value={notas} onChange={(event) => setNotas(event.target.value)} rows="2" />
          </label>
          <div className="total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button className="button mercado-pago full" onClick={confirmarPedido} disabled={procesandoPago}>
            <Icon name="card" />
            {procesandoPago ? 'Preparando pago...' : 'Pagar con Mercado Pago'}
          </button>
          {!isAuthenticated && <Link className="helper-link" to="/login"><Icon name="login" />Entrar o registrarme</Link>}
        </aside>
      </section>

      {itemEnEdicion && (
        <PersonalizationEditorModal
          item={itemEnEdicion}
          onAgregarImagen={(archivo) => agregarImagenPersonalizacion(itemEnEdicion.uid, archivo)}
          onAgregarTexto={() => agregarTextoPersonalizacion(itemEnEdicion.uid)}
          onCambiarImagen={(imagenId, campo, valor) => cambiarImagenPersonalizacion(itemEnEdicion.uid, imagenId, campo, valor)}
          onCambiarTexto={(textoId, campo, valor) => cambiarTextoPersonalizacion(itemEnEdicion.uid, textoId, campo, valor)}
          onCerrar={() => setEditorUid('')}
          onQuitarImagen={(imagenId) => quitarImagenPersonalizacion(itemEnEdicion.uid, imagenId)}
          onQuitarTexto={(textoId) => quitarTextoPersonalizacion(itemEnEdicion.uid, textoId)}
          onSelectImagen={(imagenId) => cambiarPersonalizacion(itemEnEdicion.uid, 'imagen_activa', imagenId)}
          onSelectTexto={(textoId) => cambiarPersonalizacion(itemEnEdicion.uid, 'texto_activo', textoId)}
        />
      )}
    </main>
  );
}

function crearPersonalizacionInicial() {
  const texto = crearTextoPersonalizacion();
  return {
    textos: [texto],
    texto_activo: texto.id,
    imagenes: [],
    imagen_activa: '',
  };
}

function crearTextoPersonalizacion() {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    texto: '',
    fuente: FUENTES_TEXTO[0].value,
    color: '#111111',
    x: 50,
    y: 34,
    escala: 100,
    rotacion: 0,
  };
}

function crearImagenPersonalizacion(archivo) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    archivo,
    url: URL.createObjectURL(archivo),
    x: 50,
    y: 42,
    escala: 100,
    rotacion: 0,
  };
}

function LayerNumberGrid({ layer, onChange }) {
  return (
    <div className="number-grid">
      <NumberStepper label="X" max={88} min={12} onChange={(valor) => onChange('x', valor)} value={layer.x ?? 50} />
      <NumberStepper label="Y" max={86} min={14} onChange={(valor) => onChange('y', valor)} value={layer.y ?? 34} />
      <NumberStepper label="Tam" max={190} min={45} onChange={(valor) => onChange('escala', valor)} value={layer.escala ?? 100} />
      <NumberStepper label="Rot" max={180} min={-180} onChange={(valor) => onChange('rotacion', valor)} value={layer.rotacion ?? 0} />
    </div>
  );
}

function NumberStepper({ label, max, min, onChange, value }) {
  function cambiar(valor) {
    onChange(Math.round(limitar(Number(valor), min, max)));
  }

  return (
    <label className="number-stepper">
      <span>{label}</span>
      <div>
        <button type="button" onClick={() => cambiar(value - 1)}>-</button>
        <input
          max={max}
          min={min}
          type="number"
          value={value}
          onChange={(event) => cambiar(event.target.value)}
        />
        <button type="button" onClick={() => cambiar(value + 1)}>+</button>
      </div>
    </label>
  );
}

function PersonalizationEditorModal({
  item,
  onAgregarImagen,
  onAgregarTexto,
  onCambiarImagen,
  onCambiarTexto,
  onCerrar,
  onQuitarImagen,
  onQuitarTexto,
  onSelectImagen,
  onSelectTexto,
}) {
  return (
    <div className="editor-backdrop">
      <section className="editor-modal">
        <div className="editor-topbar">
          <div>
            <p className="eyebrow">Personalizacion</p>
            <h2>{item.producto}</h2>
            <span>{item.color} / {item.talla}</span>
          </div>
          <button className="button primary" type="button" onClick={onCerrar}>
            Finalizar
          </button>
        </div>

        <div className="editor-workspace">
          <div className="editor-stage">
            <PersonalizationPreview
              editable
              item={item}
              onChangeTexto={onCambiarTexto}
              onChangeImagen={onCambiarImagen}
              onSelectImagen={onSelectImagen}
              onSelectTexto={onSelectTexto}
            />
          </div>

          <aside className="editor-tools">
            <div className="personalization-section">
              <div className="mini-section-head">
                <strong>Textos</strong>
              </div>
              <button className="button secondary full" type="button" onClick={onAgregarTexto}>
                <Icon name="plus" />
                Agregar otro texto
              </button>

              {item.personalizacion.textos.map((texto, index) => (
                <div
                  className={`text-editor ${item.personalizacion.texto_activo === texto.id ? 'is-active' : ''}`}
                  key={texto.id}
                  onClick={() => onSelectTexto(texto.id)}
                >
                  <div className="text-editor-head">
                    <span>Texto {index + 1}</span>
                    {item.personalizacion.textos.length > 1 && (
                      <button className="link-button" type="button" onClick={() => onQuitarTexto(texto.id)}>
                        <Icon name="trash" />
                      </button>
                    )}
                  </div>
                  <label>
                    Contenido
                    <input
                      value={texto.texto}
                      onChange={(event) => onCambiarTexto(texto.id, 'texto', event.target.value)}
                      placeholder="Nombre, frase o indicacion"
                    />
                  </label>
                  <div className="personalization-grid">
                    <label>
                      Fuente
                      <select
                        value={texto.fuente}
                        onChange={(event) => onCambiarTexto(texto.id, 'fuente', event.target.value)}
                      >
                        {FUENTES_TEXTO.map((fuente) => (
                          <option key={fuente.value} value={fuente.value}>{fuente.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Color
                      <input
                        type="color"
                        value={texto.color}
                        onChange={(event) => onCambiarTexto(texto.id, 'color', event.target.value)}
                      />
                    </label>
                  </div>
                  <LayerNumberGrid
                    layer={texto}
                    onChange={(campo, valor) => onCambiarTexto(texto.id, campo, valor)}
                  />
                </div>
              ))}
            </div>

            <div className="personalization-section">
              <div className="mini-section-head">
                <strong>Imagenes</strong>
                <label className="file-button">
                  <Icon name="plus" />
                  Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => onAgregarImagen(event.target.files?.[0])}
                  />
                </label>
              </div>
              {!item.personalizacion.imagenes.length && (
                <p className="muted">Agrega una imagen para editarla como capa.</p>
              )}
              {item.personalizacion.imagenes.map((imagen, index) => (
                <div
                  className={`text-editor ${item.personalizacion.imagen_activa === imagen.id ? 'is-active' : ''}`}
                  key={imagen.id}
                  onClick={() => onSelectImagen(imagen.id)}
                >
                  <div className="text-editor-head">
                    <span>Imagen {index + 1}</span>
                    <button className="link-button" type="button" onClick={() => onQuitarImagen(imagen.id)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                  <div className="image-layer-row">
                    <img src={imagen.url} alt={`Imagen personalizada ${index + 1}`} />
                    <span>{imagen.archivo?.name || 'Imagen'}</span>
                  </div>
                  <LayerNumberGrid
                    layer={imagen}
                    onChange={(campo, valor) => onCambiarImagen(imagen.id, campo, valor)}
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function PersonalizationPreview({
  editable = true,
  item,
  onChangeImagen,
  onChangeTexto,
  onSelectImagen,
  onSelectTexto,
}) {
  const { personalizacion } = item;
  const textos = obtenerTextosActivos(personalizacion);
  const imagenes = personalizacion.imagenes || [];
  const tienePersonalizacion = textos.length > 0 || imagenes.length > 0;
  const textoActivo = personalizacion.texto_activo || personalizacion.textos[0]?.id;
  const imagenActiva = personalizacion.imagen_activa;

  if (!editable && tienePersonalizacion) {
    return <RenderedPersonalizationPreview item={item} />;
  }

  function obtenerPunto(event) {
    if (!editable) return;
    const stage = event.currentTarget.closest('.preview-garment');
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    const x = limitar(((event.clientX - rect.left) / rect.width) * 100, 12, 88);
    const y = limitar(((event.clientY - rect.top) / rect.height) * 100, 14, 86);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  }

  function moverTexto(event, texto) {
    const punto = obtenerPunto(event);
    if (!punto) return;
    const { x, y } = punto;
    onChangeTexto(texto.id, 'x', Number(x.toFixed(1)));
    onChangeTexto(texto.id, 'y', Number(y.toFixed(1)));
  }

  function moverImagen(event, imagen) {
    const punto = obtenerPunto(event);
    if (!punto) return;
    onChangeImagen(imagen.id, 'x', punto.x);
    onChangeImagen(imagen.id, 'y', punto.y);
  }

  function iniciarArrastreTexto(event, texto) {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectTexto(texto.id);
    event.currentTarget.setPointerCapture(event.pointerId);
    moverTexto(event, texto);
  }

  function iniciarArrastreImagen(event, imagen) {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectImagen(imagen.id);
    event.currentTarget.setPointerCapture(event.pointerId);
    moverImagen(event, imagen);
  }

  return (
    <div className={`order-preview ${editable ? 'is-editor-preview' : 'is-compact-preview'}`}>
      <div
        className={`preview-garment ${tienePersonalizacion ? 'is-draggable' : ''}`}
      >
        {item.producto_imagen ? (
          <img src={item.producto_imagen} alt={`Vista previa de ${item.producto}`} />
        ) : (
          <span>{item.producto}</span>
        )}
        {imagenes.map((imagen) => (
          <div
            className={`image-transform-box ${editable && imagenActiva === imagen.id ? 'is-active' : ''}`}
            key={imagen.id}
            onClick={() => editable && onSelectImagen(imagen.id)}
            style={{
              left: `${imagen.x ?? 50}%`,
              top: `${imagen.y ?? 42}%`,
              transform: `translate(-50%, -50%) rotate(${imagen.rotacion || 0}deg)`,
              '--layer-size': `${(imagen.escala || 100) * (editable ? 1 : 0.56)}px`,
            }}
          >
            {editable && (
              <span
                className="transform-handle"
                onPointerDown={(event) => iniciarArrastreImagen(event, imagen)}
                onPointerMove={(event) => {
                  if (event.buttons === 1) moverImagen(event, imagen);
                }}
              />
            )}
            <img
              className="preview-art"
              src={imagen.url}
              alt="Imagen personalizada"
            />
          </div>
        ))}
        {textos.map((texto) => (
          <div
            className={`text-transform-box ${editable && textoActivo === texto.id ? 'is-active' : ''}`}
            key={texto.id}
            onClick={() => editable && onSelectTexto(texto.id)}
            style={{
              left: `${texto.x ?? 50}%`,
              top: `${texto.y ?? 34}%`,
              transform: `translate(-50%, -50%) rotate(${texto.rotacion || 0}deg)`,
            }}
          >
            {editable && (
              <span
                className="transform-handle"
                onPointerDown={(event) => iniciarArrastreTexto(event, texto)}
                onPointerMove={(event) => {
                  if (event.buttons === 1) moverTexto(event, texto);
                }}
              />
            )}
            <span
              className="preview-text"
              contentEditable={editable}
              suppressContentEditableWarning
              onInput={(event) => editable && onChangeTexto(texto.id, 'texto', event.currentTarget.textContent || '')}
              onPointerDown={(event) => {
                event.stopPropagation();
                if (editable) onSelectTexto(texto.id);
              }}
              style={{
                color: texto.color || '#111111',
                fontFamily: texto.fuente || FUENTES_TEXTO[0].value,
                fontSize: editable
                  ? `clamp(0.7rem, ${(texto.escala || 100) / 78}rem, 3rem)`
                  : `clamp(0.48rem, ${(texto.escala || 100) / 130}rem, 1.45rem)`,
              }}
            >
              {texto.texto}
            </span>
          </div>
        ))}
        {!tienePersonalizacion && (
          <span className="preview-empty">Vista previa</span>
        )}
      </div>
      <small>Mueve las capas desde el punto del marco o ajusta valores en el panel.</small>
    </div>
  );
}

function RenderedPersonalizationPreview({ item }) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    let activo = true;
    let urlTemporal = '';

    crearImagenVistaPrevia(item)
      .then((blob) => {
        if (!activo || !blob) return;
        urlTemporal = URL.createObjectURL(blob);
        setPreviewUrl(urlTemporal);
      })
      .catch(() => setPreviewUrl(''));

    return () => {
      activo = false;
      if (urlTemporal) URL.revokeObjectURL(urlTemporal);
    };
  }, [item]);

  return (
    <div className="order-preview is-rendered-preview">
      <div className="preview-garment">
        {previewUrl ? (
          <img src={previewUrl} alt={`Vista previa personalizada de ${item.producto}`} />
        ) : (
          <span className="preview-empty">Generando vista previa</span>
        )}
      </div>
    </div>
  );
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function obtenerTextosActivos(personalizacion) {
  return (personalizacion?.textos || [])
    .map((texto) => ({
      ...texto,
      texto: texto.texto?.trim() || '',
    }))
    .filter((texto) => texto.texto);
}

async function prepararPersonalizacion(item, token) {
  const { personalizacion } = item;
  const textos = obtenerTextosActivos(personalizacion);
  const imagenes = personalizacion.imagenes || [];
  const tieneTexto = textos.length > 0;
  const tieneImagen = imagenes.length > 0;
  if (!tieneTexto && !tieneImagen) return null;

  const imagenesPreparadas = await Promise.all(imagenes.map(async (imagen) => {
    if (!imagen.archivo) return imagen;
    const formData = new FormData();
    formData.append('imagen', imagen.archivo);
    const subida = await api.postForm('/personalizaciones/imagen', formData, token);
    return { ...imagen, url: subida.url_imagen, archivo: null };
  }));
  const urlImagen = imagenesPreparadas[0]?.url || '';

  let urlVistaPrevia = '';
  try {
    const vistaPrevia = await crearImagenVistaPrevia({
      ...item,
      personalizacion: {
        ...personalizacion,
        imagenes: imagenesPreparadas,
      },
    });
    if (vistaPrevia) {
      const formData = new FormData();
      formData.append('imagen', vistaPrevia, `personalizacion-${item.uid}.webp`);
      const subidaVista = await api.postForm('/personalizaciones/imagen', formData, token);
      urlVistaPrevia = subidaVista.url_imagen;
    }
  } catch (err) {
    console.warn('No se pudo generar la vista previa de la personalizacion', err);
  }

  const payload = limpiarVacios({
    tipo_personalizacion: tieneTexto && tieneImagen ? 'ambos' : tieneTexto ? 'texto' : 'imagen',
    texto_personalizado: textos.map((texto) => texto.texto).join('\n'),
    url_imagen: urlImagen?.startsWith('blob:') ? '' : urlImagen,
    url_vista_previa: urlVistaPrevia,
    color_impresion: textos[0]?.color,
  });
  return payload;
}

async function crearImagenVistaPrevia(item) {
  const canvas = document.createElement('canvas');
  const ancho = 900;
  const alto = 1125;
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#fffdfb';
  ctx.fillRect(0, 0, ancho, alto);

  if (item.producto_imagen) {
    const producto = await cargarImagen(item.producto_imagen);
    dibujarImagenContain(ctx, producto, 54, 54, ancho - 108, alto - 108);
  } else {
    ctx.fillStyle = '#6e625c';
    ctx.font = '700 42px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.producto, ancho / 2, alto / 2);
  }

  const { personalizacion } = item;
  const imagenes = personalizacion.imagenes || [];
  for (const imagen of imagenes) {
    const centroX = ((imagen.x ?? 50) / 100) * ancho;
    const centroY = ((imagen.y ?? 42) / 100) * alto;
    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.rotate(((imagen.rotacion || 0) * Math.PI) / 180);
    ctx.scale((imagen.escala || 100) / 100, (imagen.escala || 100) / 100);
    const arte = await cargarImagen(imagen.url);
    const cajaArte = { ancho: 210, alto: 150 };
    dibujarImagenContain(ctx, arte, -cajaArte.ancho / 2, -cajaArte.alto / 2, cajaArte.ancho, cajaArte.alto);
    ctx.restore();
  }

  const textos = obtenerTextosActivos(personalizacion);
  if (textos.length) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';

    textos.forEach((texto) => {
      const textoX = ((texto.x ?? 50) / 100) * ancho;
      const textoY = ((texto.y ?? 34) / 100) * alto;
      ctx.save();
      ctx.translate(textoX, textoY);
      ctx.rotate(((texto.rotacion || 0) * Math.PI) / 180);
      ctx.scale((texto.escala || 100) / 100, (texto.escala || 100) / 100);
      ctx.fillStyle = texto.color || '#111111';
      ctx.font = `900 42px ${texto.fuente || FUENTES_TEXTO[0].value}`;
      const lineas = partirTexto(ctx, texto.texto.toUpperCase(), 300);
      lineas.forEach((linea, index) => {
        const y = (index - (lineas.length - 1) / 2) * 45;
        ctx.strokeText(linea, 0, y);
        ctx.fillText(linea, 0, y);
      });
      ctx.restore();
    });
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.92);
  });
}

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = assetUrl(src);
  });
}

function dibujarImagenContain(ctx, img, x, y, ancho, alto) {
  const escala = Math.min(ancho / img.naturalWidth, alto / img.naturalHeight);
  const w = img.naturalWidth * escala;
  const h = img.naturalHeight * escala;
  ctx.drawImage(img, x + (ancho - w) / 2, y + (alto - h) / 2, w, h);
}

function partirTexto(ctx, texto, maxWidth) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas = [];
  let linea = '';

  palabras.forEach((palabra) => {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width <= maxWidth || !linea) {
      linea = prueba;
    } else {
      lineas.push(linea);
      linea = palabra;
    }
  });

  if (linea) lineas.push(linea);
  return lineas.length ? lineas : [texto];
}

function limpiarVacios(objeto) {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== '' && valor !== undefined)
  );
}
