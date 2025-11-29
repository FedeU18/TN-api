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
      monto_pedido,
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

    // Verificar que exista el estado inicial del pedido (ej: 'No pagado')
    const estadoInicial = await prisma.estadoPedido.findFirst({
      where: { nombre_estado: "No pagado" },
    });

    if (!estadoInicial) {
      return res.status(500).json({
         message: "No existe un estado inicial 'No pagado' en la base de datos.",
      });
    }

    // Crear pedido
    const pedido = await prisma.pedido.create({
      data: {
        id_cliente,
        id_vendedor: usuarioId,
        direccion_origen,
        direccion_destino,
        id_estado: estadoInicial.id_estado,
        origen_latitud: origen_latitud || null,
        origen_longitud: origen_longitud || null,
        destino_latitud: destino_latitud || null,
        destino_longitud: destino_longitud || null,
        monto_pedido: monto_pedido ? parseFloat(monto_pedido) : null,
        estado_pago: "pendiente",
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

export const getMisPedidosVendedor = async (req, res) => {
  try {
    const usuarioId = req.user?.id_usuario;
    const rol = req.user?.rol;

    if (!usuarioId || rol !== "vendedor") {
      return res
        .status(403)
        .json({ message: "No tenés permisos para ver estos pedidos." });
    }

    // Obtener todos los pedidos creados por este vendedor
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_vendedor: usuarioId,
      },
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

    return res.status(200).json({
      message: "Pedidos del vendedor obtenidos correctamente.",
      total: pedidos.length,
      pedidos,
    });
  } catch (error) {
    console.error("Error al obtener pedidos del vendedor:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getDetallePedidoVendedor = async (req, res) => {
  try {
    const usuarioId = req.user?.id_usuario;
    const rol = req.user?.rol;
    const { id_pedido } = req.params;

    if (!usuarioId || rol !== "vendedor") {
      return res
        .status(403)
        .json({ message: "No tienes permisos para ver este pedido." });
    }

    // Obtener el pedido y verificar que pertenezca al vendedor
    const pedido = await prisma.pedido.findUnique({
      where: {
        id_pedido: parseInt(id_pedido),
      },
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
            id_estado: true,
            nombre_estado: true,
          },
        },
        ubicaciones: {
          include: {
            tipo: {
              select: {
                nombre_tipo: true,
              },
            },
          },
          orderBy: {
            fecha_registro: "asc",
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    // Verificar que el pedido pertenezca al vendedor
    if (pedido.id_vendedor !== usuarioId) {
      return res.status(403).json({
        message: "No tienes permiso para ver los detalles de este pedido.",
      });
    }

    return res.status(200).json({
      message: "Detalle del pedido obtenido correctamente.",
      pedido,
    });
  } catch (error) {
    console.error("Error al obtener detalle del pedido:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
