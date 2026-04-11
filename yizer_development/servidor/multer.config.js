const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, 'uploads', 'productos');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}${ext}`;
    cb(null, safe);
  },
});

function fileFilter(_req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten archivos de imagen'));
}

const uploadProducto = multer({
  storage,
  limits: { fileSize: Number(process.env.UPLOAD_MAX_MB || 5) * 1024 * 1024 },
  fileFilter,
});

/** Ruta pública guardada en BD, p. ej. /uploads/productos/archivo.webp */
function urlPublicaProducto(filename) {
  return `/uploads/productos/${filename}`;
}

/** Elimina archivo previo si la URL apunta a nuestra carpeta de productos. */
function eliminarArchivoImagenProducto(imagenUrl) {
  if (!imagenUrl || typeof imagenUrl !== 'string') return;
  if (!imagenUrl.startsWith('/uploads/productos/')) return;
  const name = path.basename(imagenUrl);
  if (name === '.' || name === '..') return;
  const full = path.join(uploadDir, name);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
  }
}

function singleImagenProducto(req, res, next) {
  uploadProducto.single('imagen')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: err.message || 'Error al subir el archivo',
      });
    }
    next();
  });
}

module.exports = {
  uploadDir,
  uploadProducto,
  singleImagenProducto,
  urlPublicaProducto,
  eliminarArchivoImagenProducto,
};
