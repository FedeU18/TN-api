import prisma from "../lib/prisma.js";

export const enviarUbicacion = async (req, res) => {
  try {
    const { id_usuario, rol } = req.user;
    const { id_pedido, latitud, longitud } = req.body;

    // Validar rol
    if (rol.toLowerCase() !== "repartidor") {
      return res
        .status(403)
        .json({ message: "Solo los repartidores pueden enviar ubicación." });
    }

    // Validar datos
    if (!id_pedido || !latitud || !longitud) {
      return res.status(400).json({
        message: "Debe enviar id_pedido, latitud y longitud.",
      });
    }

    // Validar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id_pedido) },
      include: { repartidor: true },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    // Validar que el pedido pertenezca a este repartidor
    if (pedido.id_repartidor !== id_usuario) {
      return res
        .status(403)
        .json({ message: "Este pedido no pertenece al repartidor actual." });
    }

    // Buscar tipo de ubicación "Actual"
    const tipoUbicacion = await prisma.tipoUbicacion.findFirst({
      where: { nombre_tipo: "Actual" },
    });

    if (!tipoUbicacion) {
      return res.status(500).json({
        message: "No existe el tipo de ubicación 'Actual' en la base de datos.",
      });
    }

    // Registrar ubicación
    const ubicacion = await prisma.ubicacion.upsert({
      where: {
        id_pedido_id_tipo: {
          id_pedido: Number(id_pedido),
          id_tipo: tipoUbicacion.id_tipo,
        },
      },
      update: {
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
      },
      create: {
        id_pedido: Number(id_pedido),
        id_tipo: tipoUbicacion.id_tipo,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
      },
    });

    // Emitir evento en tiempo real
    req.io.to(`pedido_${id_pedido}`).emit("ubicacionRepartidor", {
      pedidoId: id_pedido,
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      timestamp: new Date(),
    });

    res.json({
      message: "Ubicación registrada correctamente.",
      ubicacion,
    });
  } catch (error) {
    console.error("❌ Error al enviar ubicación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const obtenerUbicacion = async (req, res) => {
  try {
    const { id_usuario, rol } = req.user;
    const { id_pedido } = req.params;

    // Validar parámetros
    if (!id_pedido) {
      return res.status(400).json({ message: "Debe enviar un id_pedido." });
    }

    // Validar que el pedido exista
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id_pedido) },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    // Si el usuario es repartidor, validar que sea el suyo
    if (
      rol.toLowerCase() === "repartidor" &&
      pedido.id_repartidor !== id_usuario
    ) {
      return res.status(403).json({
        message: "Este pedido no pertenece al repartidor actual.",
      });
    }

    // Buscar la última ubicación registrada para este pedido
    const ultimaUbicacion = await prisma.ubicacion.findFirst({
      where: { id_pedido: Number(id_pedido) },
      orderBy: { id_ubicacion: "desc" }, // la última registrada
    });

    if (!ultimaUbicacion) {
      return res
        .status(404)
        .json({ message: "No hay ubicaciones registradas para este pedido." });
    }

    res.json({
      message: "Última ubicación del repartidor obtenida correctamente.",
      ubicacion: ultimaUbicacion,
    });
  } catch (error) {
    console.error("❌ Error al obtener ubicación:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const calificarRepartidor = async (req, res) => {
  try {
    const { pedidoId, puntuacion, comentario } = req.body;
    const clienteId = req.user.id_usuario;

    // Validaciones iniciales
    if (!pedidoId || !puntuacion || !comentario) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios: pedidoId, puntuacion o comentario.",
      });
    }

    // Buscar pedido y validar pertenencia
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(pedidoId) },
      include: {
        estado: true,
      },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    // Verificar que el pedido pertenezca al cliente autenticado
    if (pedido.id_cliente !== clienteId) {
      return res
        .status(403)
        .json({
          message: "No puedes calificar un pedido que no te pertenece.",
        });
    }

    // Verificar que el pedido esté entregado
    const estadoEntregado =
      pedido.estado.nombre_estado.toLowerCase() === "entregado";
    if (!estadoEntregado) {
      return res
        .status(400)
        .json({ message: "Solo puedes calificar pedidos entregados." });
    }

    // Verificar si ya existe una calificación
    const calificacionExistente = await prisma.calificacion.findUnique({
      where: { id_pedido: Number(pedidoId) },
    });

    if (calificacionExistente) {
      return res
        .status(400)
        .json({ message: "Este pedido ya fue calificado." });
    }

    // Crear la calificación
    const nuevaCalificacion = await prisma.calificacion.create({
      data: {
        id_pedido: Number(pedidoId),
        id_cliente: clienteId,
        id_repartidor: pedido.id_repartidor,
        puntuacion: Number(puntuacion),
        comentario,
      },
    });

    res.status(201).json({
      message: "Calificación registrada correctamente.",
      calificacion: nuevaCalificacion,
    });
  } catch (error) {
    console.error("Error al calificar repartidor:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
