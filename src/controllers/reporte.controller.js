import prisma from "../lib/prisma.js";

// GET /reportes/desempeno
export const getReporteDesempeno = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, id_repartidor } = req.query;

    // 1️⃣ Filtrar pedidos por rango de fechas si se proveen
    const filtros = {};
    if (fechaInicio && fechaFin) {
      filtros.fecha_creacion = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    // Si se filtra por repartidor específico
    if (id_repartidor) {
      filtros.id_repartidor = Number(id_repartidor);
    }

    // 2️⃣ Obtener pedidos con su estado y fechas
    const pedidos = await prisma.pedido.findMany({
      where: filtros,
      include: {
        estado: true,
        repartidor: true,
      },
    });

    if (!pedidos.length) {
      return res.status(200).json({
        message: "No hay pedidos en el rango o con ese repartidor",
        resumen: {
          total_pedidos: 0,
          entregados: 0,
          pendientes: 0,
          cancelados: 0,
          promedio_entrega_horas: 0,
        },
      });
    }

    // 3️⃣ Calcular métricas
    let entregados = 0;
    let pendientes = 0;
    let cancelados = 0;
    let tiemposEntrega = []; // horas de entrega de pedidos entregados

    for (const pedido of pedidos) {
      const estado = pedido.estado.nombre_estado.toLowerCase();
      if (estado === "entregado") {
        entregados++;
        if (pedido.fecha_entrega) {
          const horas =
            (new Date(pedido.fecha_entrega) - new Date(pedido.fecha_creacion)) /
            (1000 * 60 * 60);
          tiemposEntrega.push(horas);
        }
      } else if (estado === "pendiente" || estado === "asignado") {
        pendientes++;
      } else if (estado === "cancelado") {
        cancelados++;
      }
    }

    const promedioEntrega = tiemposEntrega.length
      ? (
          tiemposEntrega.reduce((a, b) => a + b, 0) / tiemposEntrega.length
        ).toFixed(2)
      : 0;

    // 4️⃣ Agrupación de desempeño por repartidor
    const desempeñoPorRepartidor = await prisma.pedido.groupBy({
      by: ["id_repartidor"],
      where: filtros,
      _count: { id_pedido: true },
    });

    const detalleRepartidores = await Promise.all(
      desempeñoPorRepartidor.map(async (rep) => {
        const repartidor = await prisma.usuario.findUnique({
          where: { id_usuario: rep.id_repartidor },
          select: { nombre: true, apellido: true },
        });

        const entregados = await prisma.pedido.count({
          where: {
            id_repartidor: rep.id_repartidor,
            estado: { nombre_estado: "Entregado" },
          },
        });

        const cancelados = await prisma.pedido.count({
          where: {
            id_repartidor: rep.id_repartidor,
            estado: { nombre_estado: "Cancelado" },
          },
        });

        const promedioHoras = await prisma.pedido.findMany({
          where: {
            id_repartidor: rep.id_repartidor,
            estado: { nombre_estado: "Entregado" },
          },
          select: { fecha_creacion: true, fecha_entrega: true },
        });

        const horas = promedioHoras
          .filter((p) => p.fecha_entrega)
          .map(
            (p) =>
              (new Date(p.fecha_entrega) - new Date(p.fecha_creacion)) /
              (1000 * 60 * 60)
          );

        return {
          id_repartidor: rep.id_repartidor,
          nombre: `${repartidor?.nombre ?? "Desconocido"} ${
            repartidor?.apellido ?? ""
          }`,
          total_pedidos: rep._count.id_pedido,
          entregados,
          cancelados,
          promedio_horas_entrega: horas.length
            ? (horas.reduce((a, b) => a + b, 0) / horas.length).toFixed(2)
            : 0,
        };
      })
    );

    // 5️⃣ Respuesta final
    res.json({
      resumen: {
        total_pedidos: pedidos.length,
        entregados,
        pendientes,
        cancelados,
        promedio_entrega_horas: promedioEntrega,
      },
      detalle_repartidores: detalleRepartidores,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al generar el reporte de desempeño" });
  }
};
