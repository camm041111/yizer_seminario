const db = require('../config/db');

async function listarTodas(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT v.id_variante, v.id_producto, p.nombre as producto_nombre, v.color, v.talla, v.stock, v.activo
       FROM variantes_producto v
       JOIN productos_base p ON v.id_producto = p.id_producto
       ORDER BY v.id_variante`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar variantes' });
  }
}

async function listarPorProducto(req, res) {
  const { idProducto } = req.params;
  try {
    const [prod] = await db.query('SELECT id_producto FROM productos_base WHERE id_producto = ?', [
      idProducto,
    ]);
    if (!prod.length) return res.status(404).json({ error: 'Producto no encontrado' });

    const [rows] = await db.query(
      `SELECT id_variante, id_producto, color, talla, stock, activo
       FROM variantes_producto WHERE id_producto = ? ORDER BY id_variante`,
      [idProducto]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar variantes' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id_variante, id_producto, color, talla, stock, activo
       FROM variantes_producto WHERE id_variante = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Variante no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener variante' });
  }
}

async function crear(req, res) {
  const idProducto = req.params.idProducto ?? req.body.id_producto;
  const { color, talla, stock, activo } = req.body;
  if (!idProducto || !color || !talla) {
    return res.status(400).json({ error: 'id_producto (o ruta), color y talla son obligatorios' });
  }
  try {
    const [prod] = await db.query('SELECT id_producto FROM productos_base WHERE id_producto = ?', [
      idProducto,
    ]);
    if (!prod.length) return res.status(404).json({ error: 'Producto no encontrado' });

    const [result] = await db.query(
      'INSERT INTO variantes_producto (id_producto, color, talla, stock, activo) VALUES (?, ?, ?, ?, ?)',
      [idProducto, color, talla, stock ?? 0, activo !== undefined ? Boolean(activo) : true]
    );
    const [rows] = await db.query(
      'SELECT id_variante, id_producto, color, talla, stock, activo FROM variantes_producto WHERE id_variante = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear variante' });
  }
}

async function actualizar(req, res) {
  const { color, talla, stock, activo } = req.body;
  const partes = [];
  const vals = [];
  if (color !== undefined) {
    partes.push('color = ?');
    vals.push(color);
  }
  if (talla !== undefined) {
    partes.push('talla = ?');
    vals.push(talla);
  }
  if (stock !== undefined) {
    partes.push('stock = ?');
    vals.push(stock);
  }
  if (activo !== undefined) {
    partes.push('activo = ?');
    vals.push(Boolean(activo));
  }
  if (!partes.length) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  vals.push(req.params.id);
  try {
    const [result] = await db.query(
      `UPDATE variantes_producto SET ${partes.join(', ')} WHERE id_variante = ?`,
      vals
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Variante no encontrada' });
    const [rows] = await db.query(
      'SELECT id_variante, id_producto, color, talla, stock, activo FROM variantes_producto WHERE id_variante = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar variante' });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await db.query('DELETE FROM variantes_producto WHERE id_variante = ?', [
      req.params.id,
    ]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Variante no encontrada' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar variante' });
  }
}

module.exports = {
  listarTodas,
  listarPorProducto,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
