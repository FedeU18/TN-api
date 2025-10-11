import prisma from "../lib/prisma.js";
import { io } from "../index.js";

export const getAllPedidos = async (req, res) => {
  try {
    const userId = req.user.id_usuario;

    // Validar que sea admin
    const admin = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
    });

    if (!admin || admin.rol.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({
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
          },
        },
        repartidor: {
          select: {
            id_usuario: true,
            nombre: true,
            apellido: true,
            email: true,
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
    io.to(`pedido_${pedidoActualizado.id_pedido}`).emit("estadoActualizado", {
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
    io.to(`pedido_${pedidoActualizado.id_pedido}`).emit("estadoActualizado", {
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
  const { nuevoEstado } = req.body;

  try {
    const estado = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: nuevoEstado },
    });

    if (!estado) return res.status(400).json({ message: "Estado no válido" });

    const pedidoActualizado = await prisma.pedido.update({
      where: { id_pedido: Number(id) },
      data: { id_estado: estado.id_estado },
      include: { estado: true, cliente: true, repartidor: true },
    });

    //Emitir actualización por Socket.IO
    io.to(`pedido_${id}`).emit("estadoActualizado", {
      pedidoId: pedidoActualizado.id_pedido,
      nuevoEstado: pedidoActualizado.estado.nombre_estado,
    });

    res.json({
      message: `Estado del pedido actualizado a ${nuevoEstado}`,
      pedido: pedidoActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado del pedido" });
  }
};
