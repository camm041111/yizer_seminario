const jwt = require('jsonwebtoken');

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || String(s).length < 16) {
    throw new Error('JWT_SECRET debe estar definido en .env (mínimo 16 caracteres)');
  }
  return s;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido (Authorization: Bearer …)' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, getSecret());
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  next();
}

function requireAdminOrOwnCliente(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'cliente' && Number(req.params.id) === req.user.id) return next();
  return res.status(403).json({ error: 'No autorizado' });
}

module.exports = {
  getSecret,
  requireAuth,
  requireAdmin,
  requireAdminOrOwnCliente,
};
