const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { getSecret } = require('../middleware/auth');

const BCRYPT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

async function loginAdmin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id_admin, nombre_completo, email, password_hash FROM administradores WHERE email = ?',
      [email]
    );
    const row = rows[0];
    let ok = false;
    let needsHashUpgrade = false;
    if (row?.password_hash) {
      if (String(row.password_hash).startsWith('$2')) {
        ok = await bcrypt.compare(password, row.password_hash);
      } else {
        ok = password === row.password_hash;
        if (ok) {
          needsHashUpgrade = true;
        }
      }
    }

    if (ok && needsHashUpgrade) {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await db.query('UPDATE administradores SET password_hash = ? WHERE id_admin = ?', [
        hashedPassword,
        row.id_admin,
      ]);
    }

    if (!ok) {
      const envAdminEmail = process.env.ADMIN_EMAIL;
      const envAdminPassword = process.env.ADMIN_PASSWORD;
      if (envAdminEmail && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
        const token = signToken({ role: 'admin', id: row?.id_admin ?? 0, email });
        return res.json({
          token,
          user: {
            role: 'admin',
            id: row?.id_admin ?? 0,
            email,
            nombre_completo: row?.nombre_completo ?? 'Administrador',
          },
        });
      }
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signToken({
      role: 'admin',
      id: row.id_admin,
      email: row.email,
    });
    res.json({
      token,
      user: {
        role: 'admin',
        id: row.id_admin,
        email: row.email,
        nombre_completo: row.nombre_completo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

async function loginCliente(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id_cliente, nombre_completo, email, password_hash FROM clientes WHERE email = ?',
      [email]
    );
    const row = rows[0];
    if (!row?.password_hash) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signToken({
      role: 'cliente',
      id: row.id_cliente,
      email: row.email,
    });
    res.json({
      token,
      user: {
        role: 'cliente',
        id: row.id_cliente,
        email: row.email,
        nombre_completo: row.nombre_completo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

async function registroCliente(req, res) {
  const { nombre_completo, email, password, telefono } = req.body;
  if (!nombre_completo || !email || !password) {
    return res.status(400).json({ error: 'nombre_completo, email y password son obligatorios' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const [result] = await db.query(
      'INSERT INTO clientes (nombre_completo, email, password_hash, telefono) VALUES (?, ?, ?, ?)',
      [nombre_completo, email, password_hash, telefono ?? null]
    );
    const id = result.insertId;
    const token = signToken({ role: 'cliente', id, email });
    const [rows] = await db.query(
      'SELECT id_cliente, nombre_completo, email, telefono, fecha_registro FROM clientes WHERE id_cliente = ?',
      [id]
    );
    res.status(201).json({
      token,
      user: { role: 'cliente', ...rows[0] },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrarse' });
  }
}

module.exports = {
  loginAdmin,
  loginCliente,
  registroCliente,
};
