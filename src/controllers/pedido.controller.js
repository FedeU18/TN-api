import prisma from "../lib/prisma.js";
import crypto from "crypto";
import { generateQRCode } from "../utils/generateQRCode.js";
import { sendEmail } from "./sendgrid.controller.js";

//Obtener todos los pedidos (solo para admins)
export const getAllPedidos = async (req, res) => {
  try {
    const userId = req.user.id_usuario;

    // Validar que sea admin
    const admin = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
    });

    if (!admin || admin.rol.toLowerCase() !== "admin") {
      return res.status(403).json({
        message: "Solo los administradores pueden ver todos los pedidos",
      });
    }

    // Obtener todos los pedidos
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
        repartidor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
        estado: {
          select: {
            nombre_estado: true,
          },
        },
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    if (pedidos.length === 0) {
      return res.status(404).json({ message: "No hay pedidos registrados" });
    }

    res.json(pedidos);
  } catch (error) {
    console.error("Error en getAllPedidos:", error);
    res.status(500).json({ message: "Error al obtener todos los pedidos" });
  }
};

//Obtener pedidos disponibles (para asignar)
export const getPedidosDisponibles = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_repartidor: null,
        estado: { nombre_estado: "Pendiente" },
      },
      include: {
        cliente: true,
        estado: true,
      },
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pedidos disponibles" });
  }
};

//Obtener pedidos asignados (para repartidores)
export const getMisPedidos = async (req, res) => {
  const repartidorId = req.user.id_usuario;

  try {
    //Validar que el usuario sea repartidor
    const repartidor = await prisma.usuario.findUnique({
      where: { id_usuario: repartidorId },
    });

    if (!repartidor || repartidor.rol.toLowerCase() !== "repartidor") {
      return res
        .status(403)
        .json({ message: "Solo los repartidores pueden ver sus pedidos" });
    }

    //Obtener pedidos asignados al repartidor
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_repartidor: repartidorId,
      },
      include: {
        cliente: true,
        estado: true,
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener mis pedidos" });
  }
};

//Tomar pedido (para repartidores)
export const tomarPedido = async (req, res) => {
  const { id } = req.params;
  const repartidorId = req.user.id_usuario;

  try {
    //Validar que el usuario sea repartidor
    const repartidor = await prisma.usuario.findUnique({
      where: { id_usuario: repartidorId },
    });

    if (!repartidor || repartidor.rol.toLowerCase() !== "repartidor") {
      return res
        .status(403)
        .json({ message: "Solo los repartidores pueden tomar pedidos" });
    }

    //Validar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: { estado: true },
    });

    if (!pedido)
      return res.status(404).json({ message: "Pedido no encontrado" });

    if (pedido.id_repartidor)
      return res.status(400).json({ message: "El pedido ya está asignado" });

    //Estado "Asignado"
    const estadoAsignado = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: "Asignado" },
    });

    if (!estadoAsignado)
      return res.status(500).json({
        message: "No existe el estado 'Asignado' en la base de datos",
      });

    //Actualizar pedido con el repartidor que lo toma
    const pedidoActualizado = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: {
        id_repartidor: repartidorId,
        id_estado: estadoAsignado.id_estado,
      },
      include: {
        cliente: true,
        repartidor: true,
        estado: true,
      },
    });

    //Crear notificación
    const tipoNotif = await prisma.tipoNotificacion.findFirst({
      where: { nombre_tipo: "Asignación de pedido" },
    });

    if (tipoNotif) {
      await prisma.notificacion.create({
        data: {
          id_pedido: pedidoActualizado.id_pedido,
          id_usuario: repartidorId,
          id_tipo: tipoNotif.id_tipo,
          mensaje: `Has tomado el pedido #${pedidoActualizado.id_pedido}.`,
        },
      });
    }

    //Emitir actualización en tiempo real
    req.io
      .to(`pedido_${pedidoActualizado.id_pedido}`)
      .emit("estadoActualizado", {
        pedidoId: pedidoActualizado.id_pedido,
        nuevoEstado: pedidoActualizado.estado.nombre_estado,
      });

    res.json({
      message: "Pedido tomado correctamente",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al tomar el pedido" });
  }
};

//Asignar pedido a repartidor (para admins)
export const asignarPedido = async (req, res) => {
  const { id } = req.params;
  const { id_repartidor } = req.body;
  const adminId = req.user.id_usuario;

  try {
    //Validar admin
    const admin = await prisma.usuario.findUnique({
      where: { id_usuario: adminId },
    });

    if (!admin || admin.rol.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ message: "No autorizado para asignar pedidos" });
    }

    //Validar repartidor
    const repartidor = await prisma.usuario.findUnique({
      where: { id_usuario: id_repartidor },
    });

    if (!repartidor || repartidor.rol.toLowerCase() !== "repartidor") {
      return res.status(400).json({
        message: "El usuario seleccionado no es un repartidor válido",
      });
    }

    //Validar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: { estado: true },
    });

    if (!pedido)
      return res.status(404).json({ message: "Pedido no encontrado" });

    if (pedido.id_repartidor)
      return res.status(400).json({ message: "El pedido ya está asignado" });

    //Estado "Asignado"
    const estadoAsignado = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: "Asignado" },
    });

    if (!estadoAsignado)
      return res.status(500).json({
        message: "No existe el estado 'Asignado' en la base de datos",
      });

    //Actualizar pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: {
        id_repartidor,
        id_estado: estadoAsignado.id_estado,
      },
      include: {
        cliente: true,
        repartidor: true,
        estado: true,
      },
    });

    //Crear notificación
    const tipoNotif = await prisma.tipoNotificacion.findFirst({
      where: { nombre_tipo: "Asignación de pedido" },
    });

    if (tipoNotif) {
      await prisma.notificacion.create({
        data: {
          id_pedido: pedidoActualizado.id_pedido,
          id_usuario: id_repartidor,
          id_tipo: tipoNotif.id_tipo,
          mensaje: `Se te asignó el pedido #${pedidoActualizado.id_pedido}.`,
        },
      });
    }

    //Emitir actualización en tiempo real
    req.io
      .to(`pedido_${pedidoActualizado.id_pedido}`)
      .emit("estadoActualizado", {
        pedidoId: pedidoActualizado.id_pedido,
        nuevoEstado: pedidoActualizado.estado.nombre_estado,
      });

    res.json({
      message: "Pedido asignado correctamente",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al asignar el pedido" });
  }
};

//Monitorear un pedido específico
export const monitorPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: {
        cliente: true,
        repartidor: true,
        estado: true,
      },
    });

    if (!pedido)
      return res.status(404).json({ message: "Pedido no encontrado" });

    /* Comentado para evitar conflicto con la función getPedidoDetalle de mobile, si es necesario usarlo, cambiar la ruta
     * y adaptar el front-end.
    res.json({
      message: `Monitoreando el estado del pedido #${id}`,
      pedido,
    });
    */
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el pedido" });
  }
};

//Actualizar estado de un pedido (En camino, Entregado, etc.)
export const actualizarEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado, qr_token } = req.body;
  const usuarioId = req.user.id_usuario;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: { estado: true, cliente: true, repartidor: true },
    });

    if (!pedido)
      return res.status(404).json({ message: "Pedido no encontrado" });

    const estadoDestino = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: nuevoEstado },
    });

    if (!estadoDestino)
      return res.status(400).json({ message: "Estado no válido" });

    if (nuevoEstado === "Entregado") {

      try {
        // Crear link único al formulario de calificación
        const linkCalificacion = `${FRONTEND_URL}/calificar?pedidoId=${pedido.id_pedido}`;

        await sendEmail({
          to: pedido.cliente.email,
          subject: "¡Tu pedido ha sido entregado!",
          html: `
            <p>Hola ${pedido.cliente.nombre},</p>
            <p>Tu pedido #${pedido.id_pedido} ha sido entregado exitosamente.</p>
            <p>Nos encantaría saber tu opinión sobre el repartidor que realizó la entrega.</p>
            <p>
              <a href="${linkCalificacion}" style="background:#28a745;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
                Calificar Repartidor
              </a>
            </p>
            <p>¡Gracias por confiar en nosotros!</p>
          `,
        });
      } catch (mailError) {
        console.error("Error al enviar mail de calificación:", mailError);
      }

      if (pedido.id_repartidor !== usuarioId) {
        return res
          .status(403)
          .json({ message: "No autorizado para entregar este pedido" });
      }

      if (!pedido.qr_token) {
        return res
          .status(400)
          .json({ message: "El pedido no tiene un QR asociado" });
      }

      if (!qr_token) {
        return res
          .status(400)
          .json({
            message: "Debe enviarse el token del QR para entregar el pedido",
          });
      }

      if (pedido.qr_token !== qr_token) {
        return res
          .status(401)
          .json({ message: "Token QR inválido o expirado" });
      }
    }

    // Construir dataToUpdate usando el campo escalar id_estado
    const dataToUpdate = {
      id_estado: estadoDestino.id_estado,
    };

    if (nuevoEstado === "En camino") {
      const token = crypto.randomBytes(16).toString("hex");
      const qrBase64 = await generateQRCode(id, token);

      if (qrBase64) {
        dataToUpdate.qr_codigo = qrBase64; // Ojo: debe ser nullable en schema si querés setear null luego
        dataToUpdate.qr_token = token;
      }
    }

    if (nuevoEstado === "Entregado") {
      dataToUpdate.qr_token = null;
      dataToUpdate.qr_codigo = null; // Requiere qr_codigo?: String? en el schema; si no, usa "" en su lugar
      dataToUpdate.fecha_entrega = new Date();
    }

    const pedidoActualizado = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: dataToUpdate,
      include: { estado: true, cliente: true, repartidor: true },
    });

    if (req.io) {
      req.io.to(`pedido_${id}`).emit("estadoActualizado", {
        pedidoId: pedidoActualizado.id_pedido,
        nuevoEstado: pedidoActualizado.estado.nombre_estado,
      });
    }

    res.json({
      message: `Estado del pedido actualizado a ${nuevoEstado}`,
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error("❌ Error en actualizarEstadoPedido:", error);
    res.status(500).json({
      message: "Error al actualizar estado del pedido",
      error: error.message,
    });
  }
};

export const obtenerQR = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      select: { qr_codigo: true },
    });

    if (!pedido || !pedido.qr_codigo) {
      return res
        .status(404)
        .json({ message: "QR no disponible para este pedido" });
    }

    res.json({ qrBase64: pedido.qr_codigo });
  } catch (error) {
    console.error("Error al obtener QR:", error);
    res.status(500).json({ message: "Error al obtener QR" });
  }
};

export const verificarQR = async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: { cliente: true, repartidor: true, estado: true },
    });

    if (!pedido)
      return res.status(404).json({ message: "Pedido no encontrado" });

    if (!pedido.qr_token) {
      return res
        .status(400)
        .json({ message: "El pedido no tiene un QR asociado" });
    }

    if (pedido.qr_token !== token) {
      return res.status(401).json({ message: "QR no válido o expirado" });
    }

    res.json({
      message: "✅ QR verificado correctamente",
      pedido: {
        id_pedido: pedido.id_pedido,
        estado: pedido.estado.nombre_estado,
        cliente: `${pedido.cliente.nombre} ${pedido.cliente.apellido}`,
        repartidor: pedido.repartidor
          ? `${pedido.repartidor.nombre} ${pedido.repartidor.apellido}`
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al verificar QR" });
  }
};

export const obtenerUbicacionRepartidor = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    const tipoUbicacion = await prisma.tipoUbicacion.findFirst({
      where: { nombre_tipo: "Actual" },
    });

    if (!tipoUbicacion) {
      return res
        .status(500)
        .json({ message: "Tipo de ubicación 'Actual' no existe" });
    }

    const ubicacion = await prisma.ubicacion.findFirst({
      where: {
        id_pedido: Number(id),
        id_tipo: tipoUbicacion.id_tipo,
      },
      orderBy: { id_ubicacion: "desc" }, // por si tenés historial
    });

    if (!ubicacion) {
      return res
        .status(404)
        .json({ message: "No hay ubicación disponible para este pedido" });
    }

    res.json({
      pedidoId: pedido.id_pedido,
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      fecha: ubicacion.fecha_registro ?? null,
    });
  } catch (error) {
    console.error("❌ Error al obtener ubicación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const guardarUbicacionRepartidor = async (req, res) => {
  const { id } = req.params;
  const { latitud, longitud, precision, timestamp } = req.body;
  const repartidorId = req.user.id_usuario;

  try {
    console.log(
      `[guardarUbicacionRepartidor] INICIO - pedidoId: ${id}, repartidorId: ${repartidorId}`
    );
    // Validar que el pedido esté asignado al repartidor
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
    });
    console.log("[guardarUbicacionRepartidor] Pedido encontrado:", !!pedido);
    if (!pedido || pedido.id_repartidor !== repartidorId) {
      console.log(
        "[guardarUbicacionRepartidor] Pedido no autorizado para este repartidor"
      );
      return res.status(403).json({
        message: "No autorizado para actualizar la ubicación de este pedido",
      });
    }

    // Obtener tipo de ubicación "Actual"
    const tipoUbicacion = await prisma.tipoUbicacion.findFirst({
      where: { nombre_tipo: "Actual" },
    });
    console.log("[guardarUbicacionRepartidor] tipoUbicacion:", tipoUbicacion);
    if (!tipoUbicacion) {
      console.log(
        "[guardarUbicacionRepartidor] No existe el tipo de ubicación Actual"
      );
      return res
        .status(500)
        .json({ message: "Tipo de ubicación 'Actual' no existe" });
    }

    // Guardar ubicación
    let ubicacion;
    try {
      ubicacion = await prisma.ubicacion.upsert({
        where: {
          id_pedido_id_tipo: {
            id_pedido: Number(id),
            id_tipo: tipoUbicacion.id_tipo,
          },
        },
        update: {
          latitud: parseFloat(latitud),
          longitud: parseFloat(longitud),
          fecha_registro: new Date(timestamp),
        },
        create: {
          id_pedido: Number(id),
          id_tipo: tipoUbicacion.id_tipo,
          latitud: parseFloat(latitud),
          longitud: parseFloat(longitud),
          fecha_registro: new Date(timestamp),
        },
      });
      console.log(
        "[guardarUbicacionRepartidor] Ubicación guardada:",
        ubicacion
      );
    } catch (errUbicacion) {
      console.error(
        "[guardarUbicacionRepartidor] Error al guardar ubicación:",
        errUbicacion
      );
      throw errUbicacion;
    }

    // Emitir ubicación en tiempo real
    try {
      req.io.to(`pedido_${id}`).emit("ubicacionActualizada", {
        pedidoId: Number(id),
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
        timestamp: ubicacion.fecha_registro,
      });
      console.log("[guardarUbicacionRepartidor] Evento emitido por socket");
    } catch (errSocket) {
      console.error(
        "[guardarUbicacionRepartidor] Error al emitir evento socket:",
        errSocket
      );
      // No lanzar error, solo loguear
    }

    res.json({
      message: "Ubicación guardada correctamente",
      ubicacion: {
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
        timestamp: ubicacion.fecha_registro,
      },
    });
    console.log("[guardarUbicacionRepartidor] FIN OK");
  } catch (error) {
    console.error("[guardarUbicacionRepartidor] ERROR GENERAL:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
