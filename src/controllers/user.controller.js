import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

//get /api/users/me
export const getProfile = async (req, res) => {
  try {
    const { id_usuario } = req.user;

    const user = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        foto_perfil: true,
        rol: true,
        fecha_registro: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error en getProfile:", error);
    return res.status(500).json({ message: "Error al obtener perfil" });
  }
};

//put /api/users/me
export const updateProfile = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { nombre, apellido, telefono, foto_perfil } = req.body;

    const dataToUpdate = {};
    if (nombre) dataToUpdate.nombre = nombre;
    if (apellido) dataToUpdate.apellido = apellido;
    if (telefono) dataToUpdate.telefono = telefono;
    if (foto_perfil) dataToUpdate.foto_perfil = foto_perfil;

    const updatedUser = await prisma.usuario.update({
      where: { id_usuario },
      data: dataToUpdate,
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        foto_perfil: true,
        rol: true,
      },
    });

    return res.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error en updateProfile:", error);
    return res.status(500).json({ message: "Error al actualizar perfil" });
  }
};

//put /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.usuario.findUnique({ where: { id_usuario } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    //verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "La contraseña actual es incorrecta" });
    }

    //hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id_usuario },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en changePassword:", error);
    return res.status(500).json({ message: "Error al cambiar contraseña" });
  }
};
