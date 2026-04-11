const db = require('../config/db');

const TIPOS = new Set(['texto', 'imagen', 'ambos']);

async function listar(req, res) {
  const idCliente = req.query.id_cliente;
  try {
    let sql = `SELECT id_personalizacion, id_cliente, tipo_personalizacion, texto_personalizado, url_imagen,
      color_impresion, posicion, fecha_creacion FROM personalizaciones`;
    const params = [];
    if (req.user.role === 'cliente') {
      sql += ' WHERE id_cliente = ?';
      params.push(req.user.id);
    } else if (idCliente !== undefined) {
      sql += ' WHERE id_cliente = ?';
      params.push(idCliente);
    }
    sql += ' ORDER BY id_personalizacion';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar personalizaciones' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id_personalizacion, id_cliente, tipo_personalizacion, texto_personalizado, url_imagen,
        color_impresion, posicion, fecha_creacion FROM personalizaciones WHERE id_personalizacion = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Personalización no encontrada' });
    const row = rows[0];
    if (req.user.role === 'cliente') {
      if (row.id_cliente == null || row.id_cliente !== req.user.id) {
        return res.status(403).json({ error: 'No autorizado' });
      }
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener personalización' });
  }
}

async function crear(req, res) {
  const {
    id_cliente,
    tipo_personalizacion,
    texto_personalizado,
    url_imagen,
    color_impresion,
    posicion,
  } = req.body;
  if (!tipo_personalizacion || !TIPOS.has(tipo_personalizacion)) {
    return res.status(400).json({ error: 'tipo_personalizacion debe ser texto, imagen o ambos' });
  }
  let idClienteFinal = id_cliente ?? null;
  if (req.user.role === 'cliente') {
    idClienteFinal = req.user.id;
  } else if (idClienteFinal != null) {
    const [c] = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = ?', [idClienteFinal]);
    if (!c.length) return res.status(400).json({ error: 'Cliente no existe' });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO personalizaciones (id_cliente, tipo_personalizacion, texto_personalizado, url_imagen, color_impresion, posicion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        idClienteFinal,
        tipo_personalizacion,
        texto_personalizado ?? null,
        url_imagen ?? null,
        color_impresion ?? null,
        posicion ?? null,
      ]
    );
    const [rows] = await db.query(
      `SELECT id_personalizacion, id_cliente, tipo_personalizacion, texto_personalizado, url_imagen,
        color_impresion, posicion, fecha_creacion FROM personalizaciones WHERE id_personalizacion = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear personalización' });
  }
}

async function actualizar(req, res) {
  const {
    id_cliente,
    tipo_personalizacion,
    texto_personalizado,
    url_imagen,
    color_impresion,
    posicion,
  } = req.body;
  if (tipo_personalizacion !== undefined && !TIPOS.has(tipo_personalizacion)) {
    return res.status(400).json({ error: 'tipo_personalizacion debe ser texto, imagen o ambos' });
  }
  const [prev] = await db.query(
    'SELECT id_cliente FROM personalizaciones WHERE id_personalizacion = ?',
    [req.params.id]
  );
  if (!prev.length) return res.status(404).json({ error: 'Personalización no encontrada' });
  if (req.user.role === 'cliente') {
    if (prev[0].id_cliente !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    if (id_cliente !== undefined && Number(id_cliente) !== req.user.id) {
      return res.status(403).json({ error: 'No puede reasignar la personalización' });
    }
  }
  if (req.user.role === 'admin' && id_cliente !== undefined && id_cliente !== null) {
    const [c] = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = ?', [id_cliente]);
    if (!c.length) return res.status(400).json({ error: 'Cliente no existe' });
  }
  const partes = [];
  const vals = [];
  if (id_cliente !== undefined) {
    partes.push('id_cliente = ?');
    vals.push(id_cliente);
  }
  if (tipo_personalizacion !== undefined) {
    partes.push('tipo_personalizacion = ?');
    vals.push(tipo_personalizacion);
  }
  if (texto_personalizado !== undefined) {
    partes.push('texto_personalizado = ?');
    vals.push(texto_personalizado);
  }
  if (url_imagen !== undefined) {
    partes.push('url_imagen = ?');
    vals.push(url_imagen);
  }
  if (color_impresion !== undefined) {
    partes.push('color_impresion = ?');
    vals.push(color_impresion);
  }
  if (posicion !== undefined) {
    partes.push('posicion = ?');
    vals.push(posicion);
  }
  if (!partes.length) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  vals.push(req.params.id);
  try {
    const [result] = await db.query(
      `UPDATE personalizaciones SET ${partes.join(', ')} WHERE id_personalizacion = ?`,
      vals
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Personalización no encontrada' });
    const [rows] = await db.query(
      `SELECT id_personalizacion, id_cliente, tipo_personalizacion, texto_personalizado, url_imagen,
        color_impresion, posicion, fecha_creacion FROM personalizaciones WHERE id_personalizacion = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar personalización' });
  }
}

async function eliminar(req, res) {
  try {
    const [prev] = await db.query(
      'SELECT id_cliente FROM personalizaciones WHERE id_personalizacion = ?',
      [req.params.id]
    );
    if (!prev.length) return res.status(404).json({ error: 'Personalización no encontrada' });
    if (req.user.role === 'cliente' && prev[0].id_cliente !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const [result] = await db.query('DELETE FROM personalizaciones WHERE id_personalizacion = ?', [
      req.params.id,
    ]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Personalización no encontrada' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar personalización' });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
