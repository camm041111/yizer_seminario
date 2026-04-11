ALTER TABLE productos_base
  ADD COLUMN imagen_url VARCHAR(500) NULL COMMENT 'URL pública, ej. /uploads/productos/archivo.jpg' AFTER tipo_tela;
