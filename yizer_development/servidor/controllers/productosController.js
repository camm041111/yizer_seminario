const fs = require('fs');
const db = require('../config/db');
const { urlPublicaProducto, eliminarArchivoImagenProducto } = require('../multer.config');

const SELECT_PUBLICO =
  'id_producto AS id, nombre, tipo_tela AS descripcion, imagen_url, precio_base AS precio, activo, fecha_creacion';

function mapProductoBody(body) {
  return {
    nombre: body.nombre,
    tipo_tela: body.tipo_tela ?? body.descripcion ?? null,
    precio_base: body.precio_base ?? body.precio ?? null,
    activo: body.activo,
    imagen_url: body.imagen_url,
  };
}

async function listar(req, res) {
  const soloActivos = req.query.activo === '1' || req.query.activo === 'true';
  try {
    let sql = `SELECT ${SELECT_PUBLICO} FROM productos_base`;
    const params = [];
    if (soloActivos) {
      sql += ' WHERE activo = TRUE';
    }
    sql += ' ORDER BY id_producto';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar productos' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT ${SELECT_PUBLICO} FROM productos_base WHERE id_producto = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
}

async function crear(req, res) {
  const { nombre, tipo_tela, precio_base, activo, imagen_url, descripcion, precio } = req.body;
  const tipoTela = tipo_tela ?? descripcion ?? null;
  const precioBase = precio_base ?? precio;
  if (!nombre || precioBase == null) {
    return res.status(400).json({ error: 'nombre y precio son obligatorios' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO productos_base (nombre, tipo_tela, imagen_url, precio_base, activo) VALUES (?, ?, ?, ?, ?)',
      [nombre, tipoTela, imagen_url ?? null, precioBase, activo !== undefined ? Boolean(activo) : true]
    );
    const [rows] = await db.query(
      `SELECT ${SELECT_PUBLICO} FROM productos_base WHERE id_producto = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
}

async function actualizar(req, res) {
  const { nombre, tipo_tela, precio_base, activo, imagen_url, descripcion, precio } = req.body;
  const tipoTela = tipo_tela ?? descripcion;
  const precioBase = precio_base ?? precio;
  const partes = [];
  const vals = [];
  if (nombre !== undefined) {
    partes.push('nombre = ?');
    vals.push(nombre);
  }
  if (tipoTela !== undefined) {
    partes.push('tipo_tela = ?');
    vals.push(tipoTela);
  }
  if (imagen_url !== undefined) {
    const [prev] = await db.query('SELECT imagen_url FROM productos_base WHERE id_producto = ?', [
      req.params.id,
    ]);
    if (prev.length && prev[0].imagen_url && prev[0].imagen_url !== imagen_url) {
      eliminarArchivoImagenProducto(prev[0].imagen_url);
    }
    partes.push('imagen_url = ?');
    vals.push(imagen_url);
  }
  if (precioBase !== undefined) {
    partes.push('precio_base = ?');
    vals.push(precioBase);
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
      `UPDATE productos_base SET ${partes.join(', ')} WHERE id_producto = ?`,
      vals
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Producto no encontrado' });
    const [rows] = await db.query(
      `SELECT ${SELECT_PUBLICO} FROM productos_base WHERE id_producto = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
}

async function subirImagen(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Archivo requerido (campo de formulario: imagen)' });
  }
  const idProducto = req.params.id;
  const publicUrl = urlPublicaProducto(req.file.filename);
  try {
    const [prev] = await db.query('SELECT imagen_url FROM productos_base WHERE id_producto = ?', [
      idProducto,
    ]);
    if (!prev.length) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (prev[0].imagen_url) {
      eliminarArchivoImagenProducto(prev[0].imagen_url);
    }
    await db.query('UPDATE productos_base SET imagen_url = ? WHERE id_producto = ?', [
      publicUrl,
      idProducto,
    ]);
    const [rows] = await db.query(
      `SELECT ${SELECT_PUBLICO} FROM productos_base WHERE id_producto = ?`,
      [idProducto]
    );
    res.json(rows[0]);
  } catch (err) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ error: 'Error al guardar imagen' });
  }
}

async function eliminarImagen(req, res) {
  try {
    const [prev] = await db.query('SELECT imagen_url FROM productos_base WHERE id_producto = ?', [
      req.params.id,
    ]);
    if (!prev.length) return res.status(404).json({ error: 'Producto no encontrado' });
    if (prev[0].imagen_url) {
      eliminarArchivoImagenProducto(prev[0].imagen_url);
    }
    await db.query('UPDATE productos_base SET imagen_url = NULL WHERE id_producto = ?', [req.params.id]);
    const [rows] = await db.query(
      `SELECT ${SELECT_PUBLICO} FROM productos_base WHERE id_producto = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al quitar imagen' });
  }
}

async function eliminar(req, res) {
  try {
    const [prev] = await db.query('SELECT imagen_url FROM productos_base WHERE id_producto = ?', [
      req.params.id,
    ]);
    if (!prev.length) return res.status(404).json({ error: 'Producto no encontrado' });
    const [result] = await db.query('DELETE FROM productos_base WHERE id_producto = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Producto no encontrado' });
    if (prev[0].imagen_url) {
      eliminarArchivoImagenProducto(prev[0].imagen_url);
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  subirImagen,
  eliminarImagen,
  eliminar,
};
