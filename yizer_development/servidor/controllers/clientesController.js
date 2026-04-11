const bcrypt = require('bcrypt');
const db = require('../config/db');

const BCRYPT_ROUNDS = 10;

async function listar(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id_cliente, nombre_completo, email, telefono, fecha_registro FROM clientes ORDER BY id_cliente'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar clientes' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id_cliente, nombre_completo, email, telefono, fecha_registro FROM clientes WHERE id_cliente = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
}

async function crear(req, res) {
  const { nombre_completo, email, telefono, password } = req.body;
  if (!nombre_completo || !email || !password) {
    return res.status(400).json({ error: 'nombre_completo, email y password son obligatorios' });
  }
  try {
    const password_hash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
    const [result] = await db.query(
      'INSERT INTO clientes (nombre_completo, email, password_hash, telefono) VALUES (?, ?, ?, ?)',
      [nombre_completo, email, password_hash, telefono ?? null]
    );
    const [rows] = await db.query(
      'SELECT id_cliente, nombre_completo, email, telefono, fecha_registro FROM clientes WHERE id_cliente = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
}

async function actualizar(req, res) {
  const { nombre_completo, email, telefono, password } = req.body;
  const partes = [];
  const vals = [];
  if (nombre_completo !== undefined) {
    partes.push('nombre_completo = ?');
    vals.push(nombre_completo);
  }
  if (email !== undefined) {
    partes.push('email = ?');
    vals.push(email);
  }
  if (telefono !== undefined) {
    partes.push('telefono = ?');
    vals.push(telefono);
  }
  if (password !== undefined && password !== '') {
    partes.push('password_hash = ?');
    vals.push(await bcrypt.hash(String(password), BCRYPT_ROUNDS));
  }
  if (!partes.length) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  vals.push(req.params.id);
  try {
    const [result] = await db.query(
      `UPDATE clientes SET ${partes.join(', ')} WHERE id_cliente = ?`,
      vals
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Cliente no encontrado' });
    const [rows] = await db.query(
      'SELECT id_cliente, nombre_completo, email, telefono, fecha_registro FROM clientes WHERE id_cliente = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await db.query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
