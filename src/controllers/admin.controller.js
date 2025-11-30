import prisma from "../lib/prisma.js";

// Obtener todos los usuarios (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        fecha_registro: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

export const getRepartidoresConCalificaciones = async (req, res) => {
  try {
    const repartidores = await prisma.usuario.findMany({
      where: { rol: "repartidor" },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        calificacionesRepartidor: {
          select: { puntuacion: true },
        },
      },
    });

    const resultado = repartidores.map(r => {
      const calificaciones = r.calificacionesRepartidor.map(c => c.puntuacion);

      const promedio =
        calificaciones.length > 0
          ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(2)
          : 0;

      return {
        id_usuario: r.id_usuario,
        nombre: r.nombre,
        apellido: r.apellido,
        email: r.email,
        promedio_calificacion: promedio,
        total_calificaciones: calificaciones.length,
      };
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener repartidores",
      error: error.message,
    });
  }
};

// Obtener calificaciones de un repartidor específico
export const getCalificacionesDeRepartidor = async (req, res) => {
  const { id } = req.params;
    try {
    const calificaciones = await prisma.calificacion.findMany({
        where: { id_repartidor: parseInt(id) },
        select: {
            id_calificacion: true,
            puntuacion: true,
            comentario: true,
            fecha: true,
            cliente: {
                select: {
                    id_usuario: true,
                    nombre: true,
                    apellido: true,
                },
            },
        },
    });
    res.json(calificaciones);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener calificaciones del repartidor",
        error: error.message,
    });
  }
};

// Actualizar rol de un usuario
export const updateUserRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  try {
    if (!["cliente", "repartidor", "vendedor", "admin"].includes(rol)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario: parseInt(id) },
      data: { rol },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
      },
    });

    res.json({
      message: "Rol actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar rol del usuario",
      error: error.message,
    });
  }
};