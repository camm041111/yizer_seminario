const db = require('../config/db');

/**
 * Catálogo público para apps móvil: productos activos con variantes activas en un solo JSON.
 * Opcional: PUBLIC_BASE_URL en .env para devolver imagen_absoluta (ej. http://192.168.1.10:3036).
 */
async function catalogo(req, res) {
  const baseUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  try {
    const [productos] = await db.query(
      `SELECT id_producto, nombre, tipo_tela, imagen_url, precio_base, fecha_creacion
       FROM productos_base
       WHERE activo = TRUE
       ORDER BY id_producto`
    );
    const [variantes] = await db.query(
      `SELECT id_variante, id_producto, color, talla, stock
       FROM variantes_producto
       WHERE activo = TRUE
       ORDER BY id_producto, id_variante`
    );

    const map = new Map();
    for (const p of productos) {
      map.set(p.id_producto, {
        id_producto: p.id_producto,
        nombre: p.nombre,
        tipo_tela: p.tipo_tela,
        imagen_url: p.imagen_url,
        imagen_absoluta: p.imagen_url && baseUrl ? `${baseUrl}${p.imagen_url}` : null,
        precio_base: p.precio_base != null ? Number(p.precio_base) : null,
        fecha_creacion: p.fecha_creacion,
        variantes: [],
      });
    }

    for (const v of variantes) {
      const item = map.get(v.id_producto);
      if (!item) continue;
      item.variantes.push({
        id_variante: v.id_variante,
        id_producto: v.id_producto,
        color: v.color,
        talla: v.talla,
        stock: v.stock,
      });
    }

    const lista = Array.from(map.values());

    res.json({
      ok: true,
      generated_at: new Date().toISOString(),
      base_url: baseUrl || null,
      productos: lista,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener el catálogo' });
  }
}

module.exports = {
  catalogo,
};
