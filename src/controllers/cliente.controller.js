import prisma from "../lib/prisma.js";

/**
 * GET /api/clientes/pedidos
 * Obtiene los pedidos activos del cliente autenticado (Pendiente, Asignado, En camino).
 * Los pedidos completados/cancelados están en el historial.
 */
export const obtenerPedidosCliente = async (req, res) => {
  const id_cliente = req.user.id_usuario;

  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_cliente,
        estado: {
          nombre_estado: {
            in: ["Pendiente", "Asignado", "En camino"],
          },
        },
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
      },
      orderBy: { fecha_creacion: "desc" },
    });

    if (pedidos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron pedidos activos para este cliente." });
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
            tipo: { select: { nombre_tipo: true } },
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
/**
 * GET /api/clientes/pedidos/sin-calificar
 * Obtiene los pedidos entregados del cliente que aún no tienen calificación.
 */
export const obtenerPedidosSinCalificar = async (req, res) => {
  const id_cliente = req.user.id_usuario;

  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_cliente,
        estado: { nombre_estado: "Entregado" },
        calificacion: null, // No tiene calificación asociada
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
      },
      orderBy: { fecha_entrega: "desc" },
    });

    if (pedidos.length === 0) {
      return res.status(404).json({
        message: "No hay pedidos entregados pendientes de calificación.",
      });
    }

    res.json(pedidos);
  } catch (error) {
    console.error("❌ Error al obtener pedidos sin calificar:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
// services/cliente.service.js

export const getAllClientes = async (req, res) => {
  try {
    const clientes = await prisma.usuario.findMany({
      where: {
        rol: "cliente", // <-- ajustá si tus roles usan otro nombre
      },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });
    res.json({
      ok: true,
      data: clientes,
    });
  } catch (error) {
    console.error("❌ Error al obtener pedidos sin calificar:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
