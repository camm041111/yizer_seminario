const db = require('../config/db');
const pedidos = require('./pedidosController');

const MERCADO_PAGO_PREFERENCES_URL = 'https://api.mercadopago.com/checkout/preferences';
const MERCADO_PAGO_PAYMENTS_URL = 'https://api.mercadopago.com/v1/payments';

function getClientUrl(req) {
  const configuredUrl = process.env.CLIENT_URL?.trim();
  if (configuredUrl) return configuredUrl;

  const origin = req.get('origin');
  if (origin) return origin;

  const referer = req.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return 'http://localhost:5174';
    }
  }

  return 'http://localhost:5174';
}

function getMercadoPagoAccessToken() {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN;
}

function canUseAutoReturn(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
  } catch {
    return false;
  }
}

async function obtenerPagoMercadoPago(idPago) {
  const accessToken = getMercadoPagoAccessToken();
  const response = await fetch(`${MERCADO_PAGO_PAYMENTS_URL}/${idPago}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data.message || data.error || 'No se pudo consultar el pago';
    throw new Error(message);
  }
  return data;
}

async function crearPreferenciaMercadoPago(req, res) {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken) {
    return res.status(500).json({
      error: 'Falta configurar MERCADO_PAGO_ACCESS_TOKEN en el .env del servidor',
    });
  }

  const { id_pedido } = req.body;
  if (!id_pedido) {
    return res.status(400).json({ error: 'id_pedido es obligatorio' });
  }

  try {
    const [pedidos] = await db.query(
      `SELECT p.id_pedido, p.id_cliente, p.total, c.nombre_completo, c.email, c.telefono
       FROM pedidos p
       INNER JOIN clientes c ON c.id_cliente = p.id_cliente
       WHERE p.id_pedido = ?`,
      [id_pedido]
    );
    const pedido = pedidos[0];

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (req.user.role === 'cliente' && pedido.id_cliente !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const [detalles] = await db.query(
      `SELECT d.id_detalle, d.cantidad, d.precio_unitario,
              pb.nombre AS producto_nombre, v.color, v.talla
       FROM detalle_pedidos d
       INNER JOIN variantes_producto v ON v.id_variante = d.id_variante
       INNER JOIN productos_base pb ON pb.id_producto = v.id_producto
       WHERE d.id_pedido = ?`,
      [id_pedido]
    );

    if (!detalles.length) {
      return res.status(400).json({ error: 'El pedido no tiene productos para pagar' });
    }

    const baseUrl = getClientUrl(req).replace(/\/$/, '');
    const backUrls = {
      success: `${baseUrl}/dashboard?pago=aprobado&pedido=${pedido.id_pedido}`,
      pending: `${baseUrl}/dashboard?pago=pendiente&pedido=${pedido.id_pedido}`,
      failure: `${baseUrl}/dashboard?pago=fallido&pedido=${pedido.id_pedido}`,
    };
    const preferenceBody = {
      items: detalles.map((detalle) => ({
        id: String(detalle.id_detalle),
        title: `${detalle.producto_nombre} ${detalle.color}/${detalle.talla}`,
        quantity: Number(detalle.cantidad),
        unit_price: Number(detalle.precio_unitario),
        currency_id: process.env.MERCADO_PAGO_CURRENCY || 'MXN',
      })),
      payer: {
        name: pedido.nombre_completo,
        email: pedido.email,
        phone: pedido.telefono ? { number: String(pedido.telefono) } : undefined,
      },
      back_urls: backUrls,
      external_reference: String(pedido.id_pedido),
      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL || undefined,
      metadata: {
        id_pedido: pedido.id_pedido,
        id_cliente: pedido.id_cliente,
      },
    };

    if (canUseAutoReturn(baseUrl)) {
      preferenceBody.auto_return = 'approved';
    }

    const response = await fetch(MERCADO_PAGO_PREFERENCES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Mercado Pago preference error:', data);
      return res.status(502).json({
        error: data.message || data.error || 'No se pudo crear la preferencia de pago',
      });
    }

    res.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al preparar el pago' });
  }
}

async function webhookMercadoPago(req, res) {
  res.status(200).json({ received: true });

  const tipo = req.body?.type || req.body?.topic || req.query.type || req.query.topic;
  const idPago = req.body?.data?.id || req.body?.id || req.query['data.id'] || req.query.id;

  if (tipo !== 'payment' || !idPago || !getMercadoPagoAccessToken()) return;

  try {
    const pago = await obtenerPagoMercadoPago(idPago);
    const idPedido = Number(pago.external_reference || pago.metadata?.id_pedido);
    if (!idPedido) return;

    const referencia = [
      `Pago Mercado Pago: ${pago.status}`,
      pago.status_detail ? `Detalle: ${pago.status_detail}` : '',
      pago.id ? `ID pago: ${pago.id}` : '',
    ].filter(Boolean).join('\n');

    if (pago.status === 'approved') {
      await pedidos.marcarPagado(idPedido, referencia);
      return;
    }

    const [rows] = await db.query('SELECT notas FROM pedidos WHERE id_pedido = ?', [idPedido]);
    if (!rows.length) return;
    const notasActuales = rows[0].notas || '';
    const notas = notasActuales.includes(`ID pago: ${pago.id}`)
      ? notasActuales
      : [notasActuales, referencia].filter(Boolean).join('\n');
    await db.query('UPDATE pedidos SET notas = ? WHERE id_pedido = ?', [notas, idPedido]);
  } catch (err) {
    console.error('Error procesando webhook de Mercado Pago:', err);
  }
}

async function confirmarRetornoMercadoPago(req, res) {
  const paymentId = valorReal(req.body?.payment_id) || valorReal(req.body?.collection_id);
  const idPedidoRetorno = valorReal(req.body?.id_pedido);
  const estadoPagoRetorno = valorReal(req.body?.estado_pago) || valorReal(req.body?.status) || valorReal(req.body?.collection_status);
  if (!paymentId && !idPedidoRetorno) {
    return res.status(400).json({ error: 'payment_id o id_pedido es obligatorio' });
  }

  try {
    if (!paymentId) {
      const [rows] = await db.query('SELECT id_cliente FROM pedidos WHERE id_pedido = ?', [idPedidoRetorno]);
      const pedido = rows[0];
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      if (req.user.role === 'cliente' && pedido.id_cliente !== req.user.id) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const estadoNormalizado = normalizarEstadoPago(estadoPagoRetorno);
      if (estadoNormalizado !== 'approved') {
        return res.status(400).json({ error: 'El pago no esta aprobado' });
      }

      await pedidos.marcarPagado(idPedidoRetorno, 'Pago Mercado Pago: approved por retorno local');

      return res.json({
        id_pedido: Number(idPedidoRetorno),
        status: 'approved',
        status_detail: 'local_return',
      });
    }

    const pago = await obtenerPagoMercadoPago(paymentId);
    const idPedido = Number(pago.external_reference || pago.metadata?.id_pedido || idPedidoRetorno);
    if (!idPedido) return res.status(400).json({ error: 'El pago no tiene pedido asociado' });

    const [rows] = await db.query('SELECT id_cliente FROM pedidos WHERE id_pedido = ?', [idPedido]);
    const pedido = rows[0];
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (req.user.role === 'cliente' && pedido.id_cliente !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const referencia = [
      `Pago Mercado Pago: ${pago.status}`,
      pago.status_detail ? `Detalle: ${pago.status_detail}` : '',
      pago.id ? `ID pago: ${pago.id}` : '',
    ].filter(Boolean).join('\n');

    if (pago.status === 'approved') {
      await pedidos.marcarPagado(idPedido, referencia);
    }

    res.json({
      id_pedido: idPedido,
      status: pago.status,
      status_detail: pago.status_detail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al confirmar el pago' });
  }
}

module.exports = {
  crearPreferenciaMercadoPago,
  webhookMercadoPago,
  confirmarRetornoMercadoPago,
};

function normalizarEstadoPago(status) {
  if (status === 'aprobado' || status === 'approved') return 'approved';
  if (status === 'pendiente' || status === 'pending' || status === 'in_process') return 'pending';
  if (status === 'fallido' || status === 'rejected' || status === 'cancelled' || status === 'null') return 'rejected';
  return '';
}

function valorReal(valor) {
  if (valor == null || valor === '' || valor === 'null' || valor === 'undefined') return '';
  return valor;
}
