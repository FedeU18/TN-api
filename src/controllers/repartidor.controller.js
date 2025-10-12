import prisma from "../lib/prisma.js";
import { io } from "../index.js";

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
      where: { nombre_estado: "Actual" },
    });

    if (!tipoUbicacion) {
      return res.status(500).json({
        message: "No existe el tipo de ubicación 'Actual' en la base de datos.",
      });
    }

    // Registrar ubicación
    const ubicacion = await prisma.ubicacion.create({
      data: {
        id_pedido: Number(id_pedido),
        id_tipo: tipoUbicacion.id_estado,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
      },
    });

    // Emitir evento en tiempo real
    io.to(`pedido_${id_pedido}`).emit("ubicacionRepartidor", {
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
