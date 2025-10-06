import prisma from "../lib/prisma.js";

export const getPedidosDisponibles = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_repartidor: null,
        estado: {
          nombre_estado: "Pendiente", // puede ajustarse al nombre que uses
        },
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

export const asignarPedido = async (req, res) => {
  const { id } = req.params; // ID del pedido
  const { id_repartidor } = req.body;
  const adminId = req.user.id_usuario;

  try {
    // 1️⃣ Validar que el usuario autenticado sea admin
    const admin = await prisma.usuario.findUnique({
      where: { id_usuario: adminId },
    });

    if (!admin || admin.rol.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({ message: "No autorizado para asignar pedidos" });
    }

    // 2️⃣ Validar que el repartidor exista y tenga rol correcto
    const repartidor = await prisma.usuario.findUnique({
      where: { id_usuario: id_repartidor },
    });

    if (!repartidor || repartidor.rol.toLowerCase() !== "repartidor") {
      return res
        .status(400)
        .json({
          message: "El usuario seleccionado no es un repartidor válido",
        });
    }

    // 3️⃣ Validar que el pedido exista y no esté asignado
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: Number(id) },
      include: { estado: true },
    });

    if (!pedido)
      return res.status(404).json({ message: "Pedido no encontrado" });

    if (pedido.id_repartidor)
      return res
        .status(400)
        .json({ message: "El pedido ya está asignado a un repartidor" });

    // 4️⃣ Buscar estado "Asignado"
    const estadoAsignado = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: "Asignado" },
    });

    if (!estadoAsignado)
      return res
        .status(500)
        .json({
          message: "No existe el estado 'Asignado' en la base de datos",
        });

    // 5️⃣ Actualizar pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: {
        id_repartidor: id_repartidor,
        id_estado: estadoAsignado.id_estado,
      },
      include: {
        cliente: true,
        repartidor: true,
        estado: true,
      },
    });

    // 6️⃣ Crear notificación para el repartidor
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

    res.json({
      message: "Pedido asignado correctamente al repartidor seleccionado",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al asignar el pedido" });
  }
};
