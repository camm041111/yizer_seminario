const db = require('../config/db');

const ESTADOS = new Set(['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado']);

async function listar(req, res) {
  const idCliente = req.query.id_cliente;
  const estado = req.query.estado;
  try {
    let sql = `SELECT id_pedido, id_cliente, fecha_pedido, estado, total, direccion_envio, notas FROM pedidos WHERE 1=1`;
    const params = [];
    if (req.user.role === 'cliente') {
      sql += ' AND id_cliente = ?';
      params.push(req.user.id);
    } else if (idCliente !== undefined) {
      sql += ' AND id_cliente = ?';
      params.push(idCliente);
    }
    if (estado !== undefined) {
      sql += ' AND estado = ?';
      params.push(estado);
    }
    sql += ' ORDER BY fecha_pedido DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar pedidos' });
  }
}

async function obtenerDetallePedido(idPedido) {
  const [detalles] = await db.query(
    `SELECT d.id_detalle, d.id_pedido, d.id_variante, d.id_personalizacion, d.cantidad, d.precio_unitario, d.subtotal,
            v.id_producto, v.color, v.talla,
            pb.nombre AS producto_nombre, pb.imagen_url AS producto_imagen_url, pb.tipo_tela AS producto_tipo_tela,
            per.tipo_personalizacion AS personalizacion_tipo, per.texto_personalizado AS personalizacion_texto, per.url_imagen AS personalizacion_url,
            per.color_impresion AS personalizacion_color, per.posicion AS personalizacion_posicion
     FROM detalle_pedidos d
     INNER JOIN variantes_producto v ON v.id_variante = d.id_variante
     INNER JOIN productos_base pb ON pb.id_producto = v.id_producto
     LEFT JOIN personalizaciones per ON per.id_personalizacion = d.id_personalizacion
     WHERE d.id_pedido = ?
     ORDER BY d.id_detalle`,
    [idPedido]
  );
  return detalles;
}

async function obtenerPorId(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id_pedido, id_cliente, fecha_pedido, estado, total, direccion_envio, notas FROM pedidos WHERE id_pedido = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
    const pedido = rows[0];
    if (req.user.role === 'cliente' && pedido.id_cliente !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    pedido.detalles = await obtenerDetallePedido(pedido.id_pedido);
    res.json(pedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
}

function validarLineas(detalles) {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return 'Se requiere un array detalles con al menos una línea';
  }
  for (const linea of detalles) {
    if (linea.id_variante == null || linea.cantidad == null || linea.precio_unitario == null) {
      return 'Cada línea debe incluir id_variante, cantidad y precio_unitario';
    }
    if (Number(linea.cantidad) <= 0) {
      return 'La cantidad debe ser mayor que 0';
    }
  }
  return null;
}

async function crear(req, res) {
  const { id_cliente, estado, direccion_envio, notas, detalles } = req.body;
  let idClienteFinal;
  let estadoFinal;
  if (req.user.role === 'cliente') {
    idClienteFinal = req.user.id;
    estadoFinal = 'pendiente';
  } else {
    if (id_cliente == null) {
      return res.status(400).json({ error: 'id_cliente es obligatorio' });
    }
    idClienteFinal = id_cliente;
    estadoFinal = estado ?? 'pendiente';
    if (!ESTADOS.has(estadoFinal)) {
      return res.status(400).json({ error: 'estado no válido' });
    }
  }
  const errLineas = validarLineas(detalles);
  if (errLineas) return res.status(400).json({ error: errLineas });

  const [cli] = await db.query('SELECT id_cliente FROM clientes WHERE id_cliente = ?', [idClienteFinal]);
  if (!cli.length) return res.status(400).json({ error: 'Cliente no existe' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [insPedido] = await conn.query(
      `INSERT INTO pedidos (id_cliente, estado, total, direccion_envio, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [idClienteFinal, estadoFinal, 0, direccion_envio ?? null, notas ?? null]
    );
    const idPedido = insPedido.insertId;

    for (const linea of detalles) {
      const idPers = linea.id_personalizacion != null ? linea.id_personalizacion : null;
      if (idPers != null) {
        const [p] = await conn.query(
          'SELECT id_personalizacion, id_cliente FROM personalizaciones WHERE id_personalizacion = ?',
          [idPers]
        );
        if (!p.length) {
          await conn.rollback();
          return res.status(400).json({ error: `Personalización ${idPers} no existe` });
        }
        if (
          req.user.role === 'cliente' &&
          p[0].id_cliente != null &&
          p[0].id_cliente !== req.user.id
        ) {
          await conn.rollback();
          return res.status(403).json({ error: 'No puede usar esa personalización' });
        }
      }
      const [v] = await conn.query(
        'SELECT id_variante FROM variantes_producto WHERE id_variante = ?',
        [linea.id_variante]
      );
      if (!v.length) {
        await conn.rollback();
        return res.status(400).json({ error: `Variante ${linea.id_variante} no existe` });
      }

      await conn.query(
        `INSERT INTO detalle_pedidos (id_pedido, id_variante, id_personalizacion, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?, ?)`,
        [
          idPedido,
          linea.id_variante,
          idPers,
          linea.cantidad,
          linea.precio_unitario,
        ]
      );
    }

    const [sumRows] = await conn.query(
      'SELECT COALESCE(SUM(subtotal), 0) AS s FROM detalle_pedidos WHERE id_pedido = ?',
      [idPedido]
    );
    const suma = Number(sumRows[0].s);
    await conn.query('UPDATE pedidos SET total = ? WHERE id_pedido = ?', [suma, idPedido]);

    await conn.commit();

    const [rows] = await db.query(
      `SELECT id_pedido, id_cliente, fecha_pedido, estado, total, direccion_envio, notas FROM pedidos WHERE id_pedido = ?`,
      [idPedido]
    );
    const pedido = rows[0];
    pedido.detalles = await obtenerDetallePedido(idPedido);
    res.status(201).json(pedido);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al crear pedido' });
  } finally {
    conn.release();
  }
}

async function actualizar(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden modificar pedidos' });
  }
  const { estado, total, direccion_envio, notas } = req.body;
  if (estado !== undefined && !ESTADOS.has(estado)) {
    return res.status(400).json({ error: 'estado no válido' });
  }
  const partes = [];
  const vals = [];
  if (estado !== undefined) {
    partes.push('estado = ?');
    vals.push(estado);
  }
  if (total !== undefined) {
    partes.push('total = ?');
    vals.push(total);
  }
  if (direccion_envio !== undefined) {
    partes.push('direccion_envio = ?');
    vals.push(direccion_envio);
  }
  if (notas !== undefined) {
    partes.push('notas = ?');
    vals.push(notas);
  }
  if (!partes.length) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  vals.push(req.params.id);
  try {
    const [result] = await db.query(`UPDATE pedidos SET ${partes.join(', ')} WHERE id_pedido = ?`, vals);
    if (!result.affectedRows) return res.status(404).json({ error: 'Pedido no encontrado' });
    const [rows] = await db.query(
      `SELECT id_pedido, id_cliente, fecha_pedido, estado, total, direccion_envio, notas FROM pedidos WHERE id_pedido = ?`,
      [req.params.id]
    );
    const pedido = rows[0];
    pedido.detalles = await obtenerDetallePedido(pedido.id_pedido);
    res.json(pedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
}

async function agregarDetalle(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  const idPedido = req.params.idPedido;
  const { id_variante, id_personalizacion, cantidad, precio_unitario } = req.body;
  if (id_variante == null || cantidad == null || precio_unitario == null) {
    return res.status(400).json({ error: 'id_variante, cantidad y precio_unitario son obligatorios' });
  }
  if (Number(cantidad) <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser mayor que 0' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [p] = await conn.query('SELECT id_pedido FROM pedidos WHERE id_pedido = ?', [idPedido]);
    if (!p.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const idPers = id_personalizacion != null ? id_personalizacion : null;
    if (idPers != null) {
      const [pers] = await conn.query(
        'SELECT id_personalizacion FROM personalizaciones WHERE id_personalizacion = ?',
        [idPers]
      );
      if (!pers.length) {
        await conn.rollback();
        return res.status(400).json({ error: 'Personalización no existe' });
      }
    }
    const [v] = await conn.query(
      'SELECT id_variante FROM variantes_producto WHERE id_variante = ?',
      [id_variante]
    );
    if (!v.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'Variante no existe' });
    }

    const [ins] = await conn.query(
      `INSERT INTO detalle_pedidos (id_pedido, id_variante, id_personalizacion, cantidad, precio_unitario)
       VALUES (?, ?, ?, ?, ?)`,
      [idPedido, id_variante, idPers, cantidad, precio_unitario]
    );

    const [sumRows] = await conn.query(
      'SELECT COALESCE(SUM(subtotal), 0) AS s FROM detalle_pedidos WHERE id_pedido = ?',
      [idPedido]
    );
    await conn.query('UPDATE pedidos SET total = ? WHERE id_pedido = ?', [sumRows[0].s, idPedido]);

    await conn.commit();

    const [rows] = await db.query(
      `SELECT id_detalle, id_pedido, id_variante, id_personalizacion, cantidad, precio_unitario, subtotal
       FROM detalle_pedidos WHERE id_detalle = ?`,
      [ins.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al agregar detalle' });
  } finally {
    conn.release();
  }
}

async function actualizarDetalle(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  const { cantidad, precio_unitario, id_personalizacion } = req.body;
  const partes = [];
  const vals = [];
  if (cantidad !== undefined) {
    partes.push('cantidad = ?');
    vals.push(cantidad);
  }
  if (precio_unitario !== undefined) {
    partes.push('precio_unitario = ?');
    vals.push(precio_unitario);
  }
  if (id_personalizacion !== undefined) {
    partes.push('id_personalizacion = ?');
    vals.push(id_personalizacion);
  }
  if (!partes.length) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  vals.push(req.params.idDetalle);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [det] = await conn.query(
      'SELECT id_pedido FROM detalle_pedidos WHERE id_detalle = ?',
      [req.params.idDetalle]
    );
    if (!det.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    if (id_personalizacion !== undefined && id_personalizacion != null) {
      const [pers] = await conn.query(
        'SELECT id_personalizacion FROM personalizaciones WHERE id_personalizacion = ?',
        [id_personalizacion]
      );
      if (!pers.length) {
        await conn.rollback();
        return res.status(400).json({ error: 'Personalización no existe' });
      }
    }

    await conn.query(`UPDATE detalle_pedidos SET ${partes.join(', ')} WHERE id_detalle = ?`, vals);

    const idPedido = det[0].id_pedido;
    const [sumRows] = await conn.query(
      'SELECT COALESCE(SUM(subtotal), 0) AS s FROM detalle_pedidos WHERE id_pedido = ?',
      [idPedido]
    );
    await conn.query('UPDATE pedidos SET total = ? WHERE id_pedido = ?', [sumRows[0].s, idPedido]);

    await conn.commit();

    const [rows] = await db.query(
      `SELECT id_detalle, id_pedido, id_variante, id_personalizacion, cantidad, precio_unitario, subtotal
       FROM detalle_pedidos WHERE id_detalle = ?`,
      [req.params.idDetalle]
    );
    res.json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar detalle' });
  } finally {
    conn.release();
  }
}

async function eliminarDetalle(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [det] = await conn.query(
      'SELECT id_pedido FROM detalle_pedidos WHERE id_detalle = ?',
      [req.params.idDetalle]
    );
    if (!det.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    const idPedido = det[0].id_pedido;
    await conn.query('DELETE FROM detalle_pedidos WHERE id_detalle = ?', [req.params.idDetalle]);

    const [sumRows] = await conn.query(
      'SELECT COALESCE(SUM(subtotal), 0) AS s FROM detalle_pedidos WHERE id_pedido = ?',
      [idPedido]
    );
    await conn.query('UPDATE pedidos SET total = ? WHERE id_pedido = ?', [sumRows[0].s, idPedido]);

    await conn.commit();
    res.status(204).send();
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar detalle' });
  } finally {
    conn.release();
  }
}

async function eliminar(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  try {
    const [result] = await db.query('DELETE FROM pedidos WHERE id_pedido = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  agregarDetalle,
  actualizarDetalle,
  eliminarDetalle,
  eliminar,
};
