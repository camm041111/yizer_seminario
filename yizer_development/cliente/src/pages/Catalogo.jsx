import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, assetUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function Catalogo() {
  const { isAuthenticated, token, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');

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
    setCarrito((actual) => {
      return [...actual, {
        uid: `${variante.id_variante}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        id_variante: variante.id_variante,
        producto: producto.nombre,
        producto_imagen: assetUrl(producto.imagen_absoluta || producto.imagen_url),
        color: variante.color,
        talla: variante.talla,
        cantidad: 1,
        precio_unitario: Number(producto.precio_base || 0),
        personalizacion: crearPersonalizacionInicial(),
      }];
    });
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

  function cambiarArchivoPersonalizacion(uid, archivo) {
    setCarrito((actual) => actual.map((item) => {
      if (item.uid !== uid) return item;
      const urlTemporal = archivo ? URL.createObjectURL(archivo) : '';
      return {
        ...item,
        personalizacion: {
          ...item.personalizacion,
          imagen_archivo: archivo || null,
          url_imagen: urlTemporal,
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

      await api.post('/pedidos', {
        direccion_envio: direccion || undefined,
        notas: notas || undefined,
        detalles,
      }, token);
      setCarrito([]);
      setDireccion('');
      setNotas('');
      setMensaje('Pedido creado. Puedes revisarlo en Mi cuenta.');
      await cargarCatalogo();
    } catch (err) {
      setMensaje(err.message);
    }
  }

  return (
    <main>
      <header className="topbar">
        <Link className="brand" to="/">Yizer</Link>
        <nav className="navlinks">
          <Link to="/catalogo">Catalogo</Link>
          {isAuthenticated ? <Link to="/dashboard">Mi cuenta</Link> : <Link to="/login">Entrar</Link>}
          {isAuthenticated && <button className="link-button" onClick={logout}>Salir</button>}
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
          <input
            className="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre o tela"
          />
          <div className="list">
            {filtrados.map((producto) => (
              <button
                className={`list-item ${productoActivo?.id_producto === producto.id_producto ? 'selected' : ''}`}
                key={producto.id_producto}
                onClick={() => seleccionarProducto(producto)}
              >
                <span>{producto.nombre}</span>
                <strong>${Number(producto.precio_base || 0).toFixed(2)}</strong>
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
                      Agregar
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
            <p className="muted">Selecciona variantes del catalogo para formar tu pedido.</p>
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
                      Quitar
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={item.cantidad}
                    onChange={(event) => cambiarItem(item.uid, { cantidad: Number(event.target.value) })}
                  />
                  <div className="personalization-box">
                    <PersonalizationPreview
                      item={item}
                      onMove={(posicion) => cambiarPersonalizacion(item.uid, 'posicion', posicion)}
                    />
                    <label>
                      Personalizacion
                      <select
                        value={item.personalizacion.tipo_personalizacion}
                        onChange={(event) => cambiarPersonalizacion(item.uid, 'tipo_personalizacion', event.target.value)}
                      >
                        <option value="">Sin personalizacion</option>
                        <option value="texto">Texto</option>
                        <option value="imagen">Imagen</option>
                        <option value="ambos">Texto e imagen</option>
                      </select>
                    </label>
                    {item.personalizacion.tipo_personalizacion && (
                      <>
                        {item.personalizacion.tipo_personalizacion !== 'imagen' && (
                          <label>
                            Texto
                            <input
                              value={item.personalizacion.texto_personalizado}
                              onChange={(event) => cambiarPersonalizacion(item.uid, 'texto_personalizado', event.target.value)}
                              placeholder="Nombre, frase o indicacion"
                            />
                          </label>
                        )}
                        {item.personalizacion.tipo_personalizacion !== 'texto' && (
                          <label>
                            Imagen
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => cambiarArchivoPersonalizacion(item.uid, event.target.files?.[0])}
                            />
                          </label>
                        )}
                        <div className="personalization-grid">
                          <label>
                            Color
                            <input
                              type="color"
                              value={item.personalizacion.color_impresion}
                              onChange={(event) => cambiarPersonalizacion(item.uid, 'color_impresion', event.target.value)}
                            />
                          </label>
                          <p className="drag-hint">Arrastra el diseno en la vista previa.</p>
                        </div>
                        <PersonalizationControls
                          posicion={item.personalizacion.posicion}
                          onChange={(posicion) => cambiarPersonalizacion(item.uid, 'posicion', posicion)}
                        />
                      </>
                    )}
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
          <button className="button primary full" onClick={confirmarPedido}>
            Confirmar pedido
          </button>
          {!isAuthenticated && <Link className="helper-link" to="/login">Entrar o registrarme</Link>}
        </aside>
      </section>
    </main>
  );
}

function crearPersonalizacionInicial() {
  return {
    tipo_personalizacion: '',
    texto_personalizado: '',
    url_imagen: '',
    imagen_archivo: null,
    color_impresion: '#111111',
    posicion: 'x:50,y:34,s:100,r:0',
  };
}

function PersonalizationPreview({ item, onMove }) {
  const { personalizacion } = item;
  const mostrarTexto = personalizacion.tipo_personalizacion !== 'imagen' && personalizacion.texto_personalizado;
  const mostrarImagen = personalizacion.tipo_personalizacion !== 'texto' && personalizacion.url_imagen;
  const tienePersonalizacion = personalizacion.tipo_personalizacion && (mostrarTexto || mostrarImagen);
  const posicion = obtenerTransformacion(personalizacion.posicion);

  function mover(event) {
    if (!tienePersonalizacion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = limitar(((event.clientX - rect.left) / rect.width) * 100, 12, 88);
    const y = limitar(((event.clientY - rect.top) / rect.height) * 100, 14, 86);
    onMove(serializarTransformacion({ ...posicion, x, y }));
  }

  function iniciarArrastre(event) {
    if (!tienePersonalizacion) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    mover(event);
  }

  return (
    <div className="order-preview">
      <div
        className={`preview-garment ${tienePersonalizacion ? 'is-draggable' : ''}`}
        onPointerDown={iniciarArrastre}
        onPointerMove={(event) => {
          if (event.buttons === 1) mover(event);
        }}
      >
        {item.producto_imagen ? (
          <img src={item.producto_imagen} alt={`Vista previa de ${item.producto}`} />
        ) : (
          <span>{item.producto}</span>
        )}
        {tienePersonalizacion ? (
          <div
            className="preview-placement"
            style={{
              left: `${posicion.x}%`,
              top: `${posicion.y}%`,
              transform: `translate(-50%, -50%) rotate(${posicion.rotacion}deg) scale(${posicion.escala / 100})`,
            }}
          >
            {mostrarImagen && (
              <img
                className="preview-art"
                src={personalizacion.url_imagen}
                alt="Imagen personalizada"
              />
            )}
            {mostrarTexto && (
              <span
                className="preview-text"
                style={{ color: personalizacion.color_impresion || '#111111' }}
              >
                {personalizacion.texto_personalizado}
              </span>
            )}
          </div>
        ) : (
          <span className="preview-empty">Vista previa</span>
        )}
      </div>
      <small>Posicion libre: {posicion.x.toFixed(0)}%, {posicion.y.toFixed(0)}%</small>
    </div>
  );
}

function PersonalizationControls({ posicion, onChange }) {
  const transformacion = obtenerTransformacion(posicion);

  function cambiar(campo, valor) {
    onChange(serializarTransformacion({
      ...transformacion,
      [campo]: Number(valor),
    }));
  }

  return (
    <div className="transform-controls">
      <label>
        Tamano
        <input
          type="range"
          min="45"
          max="180"
          value={transformacion.escala}
          onChange={(event) => cambiar('escala', event.target.value)}
        />
        <span>{transformacion.escala}%</span>
      </label>
      <label>
        Rotacion
        <input
          type="range"
          min="-180"
          max="180"
          value={transformacion.rotacion}
          onChange={(event) => cambiar('rotacion', event.target.value)}
        />
        <span>{transformacion.rotacion} grados</span>
      </label>
    </div>
  );
}

function obtenerTransformacion(posicion) {
  if (typeof posicion === 'string') {
    const match = posicion.match(/x:([\d.]+),y:([\d.]+)(?:,s:([\d.]+))?(?:,r:([-.\d]+))?/);
    if (match) {
      return {
        x: Number(match[1]),
        y: Number(match[2]),
        escala: Number(match[3] || 100),
        rotacion: Number(match[4] || 0),
      };
    }
  }
  return { x: 50, y: 34, escala: 100, rotacion: 0 };
}

function serializarTransformacion(transformacion) {
  const x = limitar(Number(transformacion.x), 12, 88).toFixed(1);
  const y = limitar(Number(transformacion.y), 14, 86).toFixed(1);
  const escala = Math.round(limitar(Number(transformacion.escala), 45, 180));
  const rotacion = Math.round(limitar(Number(transformacion.rotacion), -180, 180));
  return `x:${x},y:${y},s:${escala},r:${rotacion}`;
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

async function prepararPersonalizacion(item, token) {
  const { personalizacion } = item;
  if (!personalizacion?.tipo_personalizacion) return null;

  let urlImagen = personalizacion.url_imagen;
  if (personalizacion.imagen_archivo) {
    const formData = new FormData();
    formData.append('imagen', personalizacion.imagen_archivo);
    const subida = await api.postForm('/personalizaciones/imagen', formData, token);
    urlImagen = subida.url_imagen;
  }

  let urlVistaPrevia = '';
  try {
    const vistaPrevia = await crearImagenVistaPrevia({
      ...item,
      personalizacion: {
        ...personalizacion,
        url_imagen: urlImagen,
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
    tipo_personalizacion: personalizacion.tipo_personalizacion,
    texto_personalizado: personalizacion.texto_personalizado,
    url_imagen: urlImagen?.startsWith('blob:') ? '' : urlImagen,
    url_vista_previa: urlVistaPrevia,
    color_impresion: personalizacion.color_impresion,
    posicion: personalizacion.posicion,
  });
  const tieneTexto = Boolean(payload.texto_personalizado);
  const tieneImagen = Boolean(payload.url_imagen);

  if (!tieneTexto && !tieneImagen) return null;
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
  const posicion = obtenerTransformacion(personalizacion.posicion);
  const mostrarTexto = personalizacion.tipo_personalizacion !== 'imagen' && personalizacion.texto_personalizado;
  const mostrarImagen = personalizacion.tipo_personalizacion !== 'texto' && personalizacion.url_imagen;
  const centroX = (posicion.x / 100) * ancho;
  const centroY = (posicion.y / 100) * alto;

  ctx.save();
  ctx.translate(centroX, centroY);
  ctx.rotate((posicion.rotacion * Math.PI) / 180);
  ctx.scale(posicion.escala / 100, posicion.escala / 100);

  let offsetY = 0;
  if (mostrarImagen) {
    const arte = await cargarImagen(personalizacion.url_imagen);
    const cajaArte = { ancho: 210, alto: 150 };
    dibujarImagenContain(ctx, arte, -cajaArte.ancho / 2, -cajaArte.alto / 2, cajaArte.ancho, cajaArte.alto);
    offsetY = cajaArte.alto / 2 + 34;
  }

  if (mostrarTexto) {
    ctx.fillStyle = personalizacion.color_impresion || '#111111';
    ctx.font = '900 42px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    const lineas = partirTexto(ctx, personalizacion.texto_personalizado.toUpperCase(), 260);
    const inicioY = mostrarImagen ? offsetY : 0;
    lineas.forEach((linea, index) => {
      const y = inicioY + (index - (lineas.length - 1) / 2) * 45;
      ctx.strokeText(linea, 0, y);
      ctx.fillText(linea, 0, y);
    });
  }

  ctx.restore();

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
