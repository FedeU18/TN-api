import prisma from "../lib/prisma.js";

export const getReporteDesempeno = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, id_repartidor } = req.query;

    // 1️⃣ Filtros base
    const filtros = {};
    if (fechaInicio && fechaFin) {
      filtros.fecha_creacion = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }
    if (id_repartidor) {
      filtros.id_repartidor = Number(id_repartidor);
    }

    // 2️⃣ Obtener pedidos con estado y repartidor
    const pedidos = await prisma.pedido.findMany({
      where: filtros,
      include: {
        estado: true,
        repartidor: true,
        calificacion: true, // 👈 relación con Calificacion
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
          promedio_entrega_minutos: 0,
        },
        detalle_repartidores: [],
        series: [],
      });
    }

    // 3️⃣ Cálculos generales
    let entregados = 0;
    let pendientes = 0;
    let cancelados = 0;
    const tiemposEntrega = [];
    const calificaciones = [];

    for (const pedido of pedidos) {
      const estado = pedido.estado.nombre_estado.toLowerCase();

      if (estado === "entregado") {
        entregados++;

        if (pedido.fecha_entrega) {
          const minutos =
            (new Date(pedido.fecha_entrega) - new Date(pedido.fecha_creacion)) /
            (1000 * 60);
          tiemposEntrega.push(minutos);
        }
      } else if (["pendiente", "asignado"].includes(estado)) {
        pendientes++;
      } else if (estado === "cancelado") {
        cancelados++;
      }

      if (pedido.calificacion?.puntuacion) {
        calificaciones.push(pedido.calificacion.puntuacion);
      }
    }

    const promedioEntrega =
      tiemposEntrega.length > 0
        ? (
            tiemposEntrega.reduce((a, b) => a + b, 0) / tiemposEntrega.length
          ).toFixed(2)
        : 0;

    const promedioGeneralCalificacion =
      calificaciones.length > 0
        ? (
            calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length
          ).toFixed(2)
        : 0;

    // 4️⃣ Desempeño por repartidor
    const desempeñoPorRepartidor = await prisma.pedido.groupBy({
      by: ["id_repartidor"],
      where: {
        ...filtros,
        id_repartidor: { not: null },
      },
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
            estado: { is: { nombre_estado: "Entregado" } },
          },
        });

        const cancelados = await prisma.pedido.count({
          where: {
            id_repartidor: rep.id_repartidor,
            estado: { is: { nombre_estado: "Cancelado" } },
          },
        });

        const calificaciones = await prisma.calificacion.findMany({
          where: { id_repartidor: rep.id_repartidor },
          select: { puntuacion: true },
        });

        const promedioCalificacion =
          calificaciones.length > 0
            ? (
                calificaciones.reduce((a, b) => a + b.puntuacion, 0) /
                calificaciones.length
              ).toFixed(2)
            : 0;

        const pedidosEntregados = await prisma.pedido.findMany({
          where: {
            id_repartidor: rep.id_repartidor,
            estado: { is: { nombre_estado: "Entregado" } },
            NOT: { fecha_entrega: null },
          },
          select: { fecha_creacion: true, fecha_entrega: true },
        });

        const minutos = pedidosEntregados.map(
          (p) =>
            (new Date(p.fecha_entrega) - new Date(p.fecha_creacion)) /
            (1000 * 60)
        );

        const promedioEntregaRep =
          minutos.length > 0
            ? (minutos.reduce((a, b) => a + b, 0) / minutos.length).toFixed(2)
            : 0;

        const porcentajeExito =
          rep._count.id_pedido > 0
            ? ((entregados / rep._count.id_pedido) * 100).toFixed(1)
            : 0;

        const ratioCancelacion =
          rep._count.id_pedido > 0
            ? ((cancelados / rep._count.id_pedido) * 100).toFixed(1)
            : 0;

        return {
          id_repartidor: rep.id_repartidor,
          nombre: `${repartidor?.nombre ?? "Desconocido"} ${
            repartidor?.apellido ?? ""
          }`,
          total_pedidos: rep._count.id_pedido,
          entregados,
          cancelados,
          promedio_minutos_entrega: promedioEntregaRep,
          promedio_calificacion: promedioCalificacion,
          porcentaje_exito: porcentajeExito,
          ratio_cancelacion: ratioCancelacion,
        };
      })
    );

    // 🔽 Ordenar por calificación
    detalleRepartidores.sort(
      (a, b) => b.promedio_calificacion - a.promedio_calificacion
    );

    // 5️⃣ Series por fecha
    const series = [];
    const pedidosPorFecha = {};

    for (const pedido of pedidos) {
      const fecha = new Date(pedido.fecha_creacion).toISOString().split("T")[0];
      if (!pedidosPorFecha[fecha]) {
        pedidosPorFecha[fecha] = {
          fecha,
          entregados: 0,
          cancelados: 0,
          tiempoPromedio: 0,
          count: 0,
        };
      }

      const estado = pedido.estado.nombre_estado.toLowerCase();
      if (estado === "entregado") pedidosPorFecha[fecha].entregados++;
      if (estado === "cancelado") pedidosPorFecha[fecha].cancelados++;

      if (pedido.fecha_entrega) {
        const minutos =
          (new Date(pedido.fecha_entrega) - new Date(pedido.fecha_creacion)) /
          (1000 * 60);
        pedidosPorFecha[fecha].tiempoPromedio += minutos;
        pedidosPorFecha[fecha].count++;
      }
    }

    for (const fecha in pedidosPorFecha) {
      const d = pedidosPorFecha[fecha];
      d.tiempoPromedio =
        d.count > 0 ? (d.tiempoPromedio / d.count).toFixed(2) : 0;
      series.push({
        fecha: d.fecha,
        entregados: d.entregados,
        cancelados: d.cancelados,
        tiempoPromedio: d.tiempoPromedio,
      });
    }

    res.json({
      resumen: {
        total_pedidos: pedidos.length,
        entregados,
        pendientes,
        cancelados,
        promedio_entrega_minutos: promedioEntrega,
        promedio_calificacion_general: promedioGeneralCalificacion,
      },
      detalle_repartidores: detalleRepartidores,
      series,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al generar el reporte de desempeño",
      error: error.message,
    });
  }
};
