import prisma from "../lib/prisma.js";

export const crearPedidoVendedor = async (req, res) => {
  try {
    const usuarioId = req.user?.id_usuario; // viene del token
    const rol = req.user?.rol;

    if (!usuarioId || rol !== "vendedor") {
      return res
        .status(403)
        .json({ message: "No tienes permisos para crear pedidos." });
    }

    const {
      id_cliente,
      direccion_origen,
      direccion_destino,
      origen_latitud,
      origen_longitud,
      destino_latitud,
      destino_longitud,
    } = req.body;

    // Validación mínima
    if (!id_cliente || !direccion_origen || !direccion_destino) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // Verificar que el cliente exista
    const clienteExiste = await prisma.usuario.findUnique({
      where: { id_usuario: id_cliente },
    });

    if (!clienteExiste) {
      return res.status(404).json({ message: "El cliente no existe." });
    }

    // Verificar que exista el estado inicial del pedido (ej: 'Pendiente')
    const estadoInicial = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: "Pendiente" },
    });

    if (!estadoInicial) {
      return res.status(500).json({
        message: "No existe un estado inicial 'Pendiente' en la base de datos.",
      });
    }

    // Crear pedido
    const pedido = await prisma.pedido.create({
      data: {
        id_cliente,
        direccion_origen,
        direccion_destino,
        id_estado: estadoInicial.id_estado,
        origen_latitud: origen_latitud || null,
        origen_longitud: origen_longitud || null,
        destino_latitud: destino_latitud || null,
        destino_longitud: destino_longitud || null,
      },
    });

    return res.status(201).json({
      message: "Pedido creado correctamente.",
      pedido,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
