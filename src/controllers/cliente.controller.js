import prisma from "../lib/prisma.js";

/**
 * GET /api/clientes/pedidos
 * Obtiene todos los pedidos del cliente autenticado.
 */
export const obtenerPedidosCliente = async (req, res) => {
  const id_cliente = req.user.id_usuario;

  try {
    const pedidos = await prisma.pedido.findMany({
      where: { id_cliente },
      include: {
        estado: true,
        repartidor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            telefono: true,
          },
        },
      },
      orderBy: { fecha_creacion: "desc" },
    });

    if (pedidos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron pedidos para este cliente." });
    }

    res.json(pedidos);
  } catch (error) {
    console.error("❌ Error al obtener pedidos del cliente:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * GET /api/clientes/pedidos/:id_pedido
 * Obtiene el detalle completo de un pedido del cliente autenticado.
 */
export const obtenerDetallePedidoCliente = async (req, res) => {
  const id_cliente = req.user.id_usuario;
  const id_pedido = parseInt(req.params.id_pedido);

  try {
    const pedido = await prisma.pedido.findFirst({
      where: {
        id_pedido,
        id_cliente,
      },
      include: {
        estado: true,
        repartidor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            telefono: true,
          },
        },
        ubicaciones: {
          include: {
            tipo: { select: { nombre_estado: true } },
          },
          orderBy: { id_ubicacion: "asc" },
        },
        calificacion: true,
        notificaciones: {
          include: {
            tipo: true,
          },
          orderBy: { fecha_envio: "desc" },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        message: "Pedido no encontrado o no pertenece a este cliente.",
      });
    }

    res.json(pedido);
  } catch (error) {
    console.error("❌ Error al obtener detalle del pedido:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
