import prisma from "../lib/prisma.js";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { sendEmail } from "./sendgrid.controller.js";

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

/**
 * Obtener estado de pago de un pedido
 * GET /pagos/estado/:id_pedido
 */
export const obtenerEstadoPago = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const usuarioId = req.user?.id_usuario;

    if (!id_pedido) {
      return res.status(400).json({ message: "ID de pedido requerido" });
    }

    // Obtener pedido con su información de pago
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: parseInt(id_pedido) },
      include: {
        cliente: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        vendedor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
          },
        },
        estado: {
          select: {
            nombre_estado: true,
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar permisos (cliente, vendedor o admin)
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (
      usuario.rol !== "admin" &&
      pedido.id_cliente !== usuarioId &&
      pedido.id_vendedor !== usuarioId
    ) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para ver este pago" });
    }

    res.json({
      id_pedido: pedido.id_pedido,
      monto: pedido.monto_pedido,
      estado_pago: pedido.estado_pago,
      fecha_pago: pedido.fecha_pago,
      id_transaccion: pedido.id_transaccion_pago,
      metodo_pago: pedido.metodo_pago,
      estado_pedido: pedido.estado.nombre_estado,
      cliente: pedido.cliente,
      vendedor: pedido.vendedor,
    });
  } catch (error) {
    console.error("Error al obtener estado de pago:", error);
    res.status(500).json({ message: "Error al obtener estado de pago" });
  }
};

/**
 * Crear preferencia de pago en Mercado Pago
 * POST /pagos/crear-preferencia/:id_pedido
 */
export const crearPreferenciaPago = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const usuarioId = req.user?.id_usuario;

    if (!id_pedido) {
      return res.status(400).json({ message: "ID de pedido requerido" });
    }

    // Obtener pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: parseInt(id_pedido) },
      include: {
        cliente: { select: { nombre: true, apellido: true, email: true } },
        estado: true,
      },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar que el usuario sea el cliente
    if (pedido.id_cliente !== usuarioId) {
      return res.status(403).json({
        message: "Solo el cliente puede pagar este pedido",
      });
    }

    // Validar que el pedido esté en "No pagado"
    if (pedido.estado.nombre_estado !== "No pagado") {
      return res.status(400).json({
        message: `El pedido no está en estado "No pagado". Estado actual: ${pedido.estado.nombre_estado}`,
      });
    }

    // Validar que no haya sido ya pagado
    if (pedido.estado_pago === "pagado") {
      return res.status(400).json({
        message: "Este pedido ya fue pagado",
      });
    }

    // Si no tiene monto, no puede procesar
    if (!pedido.monto_pedido || pedido.monto_pedido <= 0) {
      return res.status(400).json({
        message: "El pedido no tiene monto válido",
      });
    }

    // Crear preferencia de Mercado Pago
    const preferenceData = {
      items: [
        {
          title: `Pedido #${pedido.id_pedido}`,
          description: `Pago del pedido ${pedido.id_pedido} - Destino: ${pedido.direccion_destino}`,
          unit_price: parseFloat(pedido.monto_pedido),
          quantity: 1,
        },
      ],
      payer: {
        name: pedido.cliente.nombre,
        email: pedido.cliente.email,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/mis-pedidos/${pedido.id_pedido}?payment=success`,
        failure: `${process.env.FRONTEND_URL}/mis-pedidos/${pedido.id_pedido}?payment=failure`,
        pending: `${process.env.FRONTEND_URL}/mis-pedidos/${pedido.id_pedido}?payment=pending`,
      },
      auto_return: "approved",
      external_reference: `pedido_${pedido.id_pedido}`,
      notification_url: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/pagos/webhook`,
    };

    // Crear preferencia
    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceData });

    // Actualizar estado_pago a "pendiente_pago"
    await prisma.pedido.update({
      where: { id_pedido: parseInt(id_pedido) },
      data: {
        estado_pago: "pendiente_pago",
      },
    });

    res.json({
      status: "success",
      init_point: response.body.init_point,
      id_preferencia: response.body.id,
      monto: pedido.monto_pedido,
    });
  } catch (error) {
    console.error("Error al crear preferencia de pago:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    res.status(500).json({ 
      message: "Error al crear preferencia de pago",
      error: error.message,
    });
  }
};

/**
 * Iniciar proceso de pago
 * POST /pagos/iniciar/:id_pedido
 * Body: { monto: number, metodo: "tarjeta" | "transferencia" }
 */
export const iniciarPago = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const usuarioId = req.user?.id_usuario;
    const { monto, metodo } = req.body;

    if (!id_pedido || !monto) {
      return res
        .status(400)
        .json({ message: "ID de pedido y monto son requeridos" });
    }

    // Obtener pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: parseInt(id_pedido) },
      include: { estado: true },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar que el usuario sea el cliente del pedido
    if (pedido.id_cliente !== usuarioId) {
      return res.status(403).json({
        message: "Solo el cliente puede iniciar el pago de este pedido",
      });
    }

    // Validar que el pedido esté en estado "No pagado"
    if (pedido.estado.nombre_estado !== "No pagado") {
      return res.status(400).json({
        message: `El pedido no está en estado "No pagado". Estado actual: ${pedido.estado.nombre_estado}`,
      });
    }

    // Validar que no haya un pago en proceso
    if (pedido.estado_pago === "pendiente_pago") {
      return res.status(400).json({
        message: "Ya hay un pago en proceso para este pedido",
      });
    }

    // Si el monto del pedido no está registrado, actualizarlo
    if (!pedido.monto_pedido) {
      await prisma.pedido.update({
        where: { id_pedido: parseInt(id_pedido) },
        data: { monto_pedido: parseFloat(monto) },
      });
    } else if (parseFloat(monto) !== parseFloat(pedido.monto_pedido)) {
      return res.status(400).json({
        message: `El monto no coincide. Esperado: ${pedido.monto_pedido}, Recibido: ${monto}`,
      });
    }

    // AQUÍ va la integración con la plataforma de pago (Mercado Pago)
    // Por ahora, retornamos un objeto simulado para la sesión de pago

    // Generar un ID de transacción temporal (será reemplazado por el proveedor)
    const idTransaccionTemporal = `txn_temp_${Date.now()}_${id_pedido}`;

    // Actualizar estado_pago a "pendiente_pago"
    await prisma.pedido.update({
      where: { id_pedido: parseInt(id_pedido) },
      data: {
        estado_pago: "pendiente_pago", // El cliente está en proceso de pago
        id_transaccion_pago: idTransaccionTemporal,
        metodo_pago: metodo || "tarjeta",
      },
    });

    // Simular sesión de pago (esto debería ser el retorno de Mercado Pago)
    res.json({
      status: "success",
      message: "Sesión de pago iniciada",
      id_transaccion: idTransaccionTemporal,
      monto,
      metodo: metodo || "tarjeta",
    });
  } catch (error) {
    console.error("Error al iniciar pago:", error);
    res.status(500).json({ message: "Error al iniciar pago" });
  }
};

/**
 * Confirmar pago (webhook desde proveedor de pago)
 * POST /pagos/confirmar
 * Body: { id_pedido, id_transaccion, estado: "pagado" | "fallido" }
 */
export const confirmarPago = async (req, res) => {
  try {
    const { id_pedido, id_transaccion, estado } = req.body;

    if (!id_pedido || !id_transaccion) {
      return res.status(400).json({
        message: "ID de pedido e ID de transacción son requeridos",
      });
    }

    // Obtener pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: parseInt(id_pedido) },
      include: { estado: true },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    if (estado === "pagado") {
      // Validar que el pedido esté en estado "No pagado" o con pago pendiente
      if (
        pedido.estado.nombre_estado !== "No pagado" &&
        pedido.estado_pago !== "pendiente_pago"
      ) {
        return res.status(400).json({
          message: `No se puede confirmar pago. El pedido está en estado ${pedido.estado.nombre_estado}`,
        });
      }

      // Obtener estado "Pendiente"
      const estadoPendiente = await prisma.estadoPedido.findFirst({
        where: { nombre_estado: "Pendiente" },
      });

      if (!estadoPendiente) {
        return res.status(500).json({
          message: "No existe el estado 'Pendiente' en la base de datos",
        });
      }

      // Actualizar pedido: cambiar estado a "Pendiente" y marcar como pagado
      const pedidoActualizado = await prisma.pedido.update({
        where: { id_pedido: parseInt(id_pedido) },
        data: {
          estado_pago: "pagado",
          id_transaccion_pago: id_transaccion,
          fecha_pago: new Date(),
          id_estado: estadoPendiente.id_estado, // Cambiar a Pendiente
        },
        include: {
          cliente: { select: { nombre: true, email: true } },
          vendedor: { select: { nombre: true, email: true } },
        },
      });

      res.json({
        status: "success",
        message: "Pago confirmado. Pedido cambió a estado 'Pendiente'",
        pedido: {
          id: pedidoActualizado.id_pedido,
          estado_pago: pedidoActualizado.estado_pago,
          fecha_pago: pedidoActualizado.fecha_pago,
        },
      });
    } else if (estado === "fallido") {
      // Validar que no haya sido ya procesado como pagado
      if (pedido.estado_pago === "pagado") {
        return res.status(400).json({
          message: "Este pago ya fue confirmado como exitoso",
        });
      }

      // Mantener en "No pagado" pero registrar el intento fallido
      await prisma.pedido.update({
        where: { id_pedido: parseInt(id_pedido) },
        data: {
          estado_pago: "fallido",
          id_transaccion_pago: id_transaccion,
        },
      });

      res.json({
        status: "success",
        message: "Pago registrado como fallido. El pedido permanece en 'No pagado'",
      });
    } else {
      return res.status(400).json({
        message: "Estado de pago inválido",
      });
    }
  } catch (error) {
    console.error("Error al confirmar pago:", error);
    res.status(500).json({ message: "Error al confirmar pago" });
  }
};

/**
 * Cancelar/reembolsar un pago
 * POST /pagos/reembolsar/:id_pedido
 */
export const reembolsarPago = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const usuarioId = req.user?.id_usuario;

    if (!id_pedido) {
      return res.status(400).json({ message: "ID de pedido requerido" });
    }

    // Obtener pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: parseInt(id_pedido) },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Verificar permisos (admin o vendedor del pedido)
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
    });

    if (usuario.rol !== "admin" && pedido.id_vendedor !== usuarioId) {
      return res.status(403).json({
        message: "No tienes permiso para reembolsar este pago",
      });
    }

    // Solo se puede reembolsar si fue pagado
    if (pedido.estado_pago !== "pagado") {
      return res.status(400).json({
        message: `No se puede reembolsar. Estado actual del pago: ${pedido.estado_pago}`,
      });
    }

    // AQUÍ va la integración con el proveedor de pago para hacer el reembolso
    // Por ahora, solo actualizamos el estado localmente

    // Obtener estado "No pagado"
    const estadoNoPagado = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: "No pagado" },
    });

    // Actualizar pedido
    await prisma.pedido.update({
      where: { id_pedido: parseInt(id_pedido) },
      data: {
        estado_pago: "reembolsado",
        id_estado: estadoNoPagado.id_estado, // Volver a "No pagado"
      },
    });

    res.json({
      status: "success",
      message: "Pago reembolsado. Pedido volvió a estado 'No pagado'",
    });
  } catch (error) {
    console.error("Error al reembolsar pago:", error);
    res.status(500).json({ message: "Error al reembolsar pago" });
  }
};

/**
 * Webhook de Mercado Pago
 * POST /pagos/webhook
 * Recibe notificaciones de pagos desde Mercado Pago
 */
export const procesarWebhookMercadoPago = async (req, res) => {
  try {
    const { type, data } = req.query;

    // Validar que sea una notificación de pago
    if (type !== "payment") {
      return res.status(200).json({ message: "Webhook recibido (no es pago)" });
    }

    if (!data || !data.id) {
      return res.status(400).json({ message: "ID de pago no proporcionado" });
    }

    // Obtener detalles del pago desde Mercado Pago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: data.id });
    const paymentData = paymentInfo;

    // Extraer ID del pedido de external_reference
    const externalReference = payment.external_reference; // "pedido_123"
    if (!externalReference || !externalReference.startsWith("pedido_")) {
      return res.status(200).json({ message: "Referencia de pedido no válida" });
    }

    const id_pedido = parseInt(externalReference.split("_")[1]);

    if (isNaN(id_pedido)) {
      return res.status(200).json({ message: "ID de pedido inválido" });
    }

    // Obtener pedido con datos del cliente y vendedor
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido },
      include: {
        estado: true,
        cliente: { select: { nombre: true, email: true } },
        vendedor: { select: { nombre: true, email: true } },
      },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Procesar según el estado del pago
    const estadoPago = paymentData.status;

    if (estadoPago === "approved") {
      // Pago aprobado
      const estadoPendiente = await prisma.estadoPedido.findFirst({
        where: { nombre_estado: "Pendiente" },
      });

      if (!estadoPendiente) {
        return res.status(500).json({
          message: "No existe el estado 'Pendiente' en la base de datos",
        });
      }

      // Actualizar pedido
      const pedidoActualizado = await prisma.pedido.update({
        where: { id_pedido },
        data: {
          estado_pago: "pagado",
          id_transaccion_pago: paymentData.id.toString(),
          fecha_pago: new Date(),
          id_estado: estadoPendiente.id_estado,
          metodo_pago: paymentData.payment_method_id,
        },
      });

      // Enviar email de confirmación al cliente
      try {
        await sendEmail({
          to: pedido.cliente.email,
          subject: `Pago confirmado - Pedido #${id_pedido}`,
          html: `
            <h2>¡Pago confirmado!</h2>
            <p>Hola ${pedido.cliente.nombre},</p>
            <p>Tu pago para el pedido #${id_pedido} ha sido procesado exitosamente.</p>
            <p><strong>Detalles del pedido:</strong></p>
            <ul>
              <li>Pedido: #${id_pedido}</li>
              <li>Monto: $${pedidoActualizado.monto_pedido?.toFixed(2) || "N/A"}</li>
              <li>Destino: ${pedidoActualizado.direccion_destino}</li>
              <li>Transacción: ${payment.id}</li>
            </ul>
            <p>Tu pedido está en la cola de repartidores. Pronto será asignado.</p>
            <p>Gracias por usar TrackNow.</p>
          `,
        });
      } catch (emailError) {
        console.error("Error al enviar email de confirmación:", emailError);
      }

      // Enviar email al vendedor
      if (pedido.vendedor?.email) {
        try {
          await sendEmail({
            to: pedido.vendedor.email,
            subject: `Pago recibido - Pedido #${id_pedido}`,
            html: `
              <h2>Pago recibido</h2>
              <p>Hola ${pedido.vendedor.nombre},</p>
              <p>El cliente ${pedido.cliente.nombre} acaba de pagar el pedido #${id_pedido}.</p>
              <p><strong>Detalles:</strong></p>
              <ul>
                <li>Monto: $${pedidoActualizado.monto_pedido?.toFixed(2) || "N/A"}</li>
                <li>Cliente: ${pedido.cliente.nombre}</li>
                <li>Destino: ${pedidoActualizado.direccion_destino}</li>
              </ul>
              <p>El pedido está ahora disponible para los repartidores.</p>
            `,
          });
        } catch (emailError) {
          console.error("Error al enviar email al vendedor:", emailError);
        }
      }

      console.log(`Pago aprobado para pedido #${id_pedido}`);
    } else if (estadoPago === "rejected") {
      // Pago rechazado
      await prisma.pedido.update({
        where: { id_pedido },
        data: {
          estado_pago: "fallido",
          id_transaccion_pago: paymentData.id.toString(),
        },
      });

      // Enviar email de rechazo al cliente
      try {
        await sendEmail({
          to: pedido.cliente.email,
          subject: `Pago rechazado - Pedido #${id_pedido}`,
          html: `
            <h2>Pago rechazado</h2>
            <p>Hola ${pedido.cliente.nombre},</p>
            <p>Lamentablemente, el pago para el pedido #${id_pedido} fue rechazado.</p>
            <p>Motivos comunes:</p>
            <ul>
              <li>Fondos insuficientes</li>
              <li>Datos de tarjeta incorrectos</li>
              <li>Tarjeta expirada</li>
            </ul>
            <p>Por favor, intenta nuevamente o utiliza otro método de pago.</p>
          `,
        });
      } catch (emailError) {
        console.error("Error al enviar email de rechazo:", emailError);
      }

      console.log(`Pago rechazado para pedido #${id_pedido}`);
    } else if (estadoPago === "pending") {
      // Pago pendiente (en revisión)
      await prisma.pedido.update({
        where: { id_pedido },
        data: {
          estado_pago: "pendiente_pago",
          id_transaccion_pago: paymentData.id.toString(),
        },
      });

      console.log(`Pago pendiente para pedido #${id_pedido}`);
    }

    // Responder a Mercado Pago
    return res.status(200).json({ message: "Webhook procesado" });
  } catch (error) {
    console.error("Error al procesar webhook de Mercado Pago:", error);
    // Retornar 200 igual para que Mercado Pago no reintente
    return res.status(200).json({ message: "Error procesando webhook" });
  }
};
