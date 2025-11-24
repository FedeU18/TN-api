import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
import cloudinary from "cloudinary";
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const uploadStreamToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "usuarios_perfil" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

//put /api/users/me
export const updateProfile = async (req, res) => {
  try {
    const { id_usuario } = req.user;

    const {
      nombre,
      apellido,
      email,
      telefono,
      // si venía en texto (base64 o url), también lo aceptamos
      foto_perfil,
    } = req.body;

    const dataToUpdate = {};

    if (nombre?.trim()) dataToUpdate.nombre = nombre.trim();
    if (apellido?.trim()) dataToUpdate.apellido = apellido.trim();
    if (email?.trim()) dataToUpdate.email = email.trim();
    if (telefono?.trim()) dataToUpdate.telefono = telefono.trim();

    // =====================================================
    // ⭐ SUBIDA DE FOTO SI VIENE ARCHIVO (multipart/form-data)
    // req.file contiene la foto binaria enviada desde el input
    // =====================================================
    if (req.file) {
      const uploadResult = await uploadStreamToCloudinary(req.file.buffer);
      dataToUpdate.foto_perfil = uploadResult.secure_url;
    } else if (foto_perfil?.trim()) {
      // si el front envía un URL o base64 manualmente
      dataToUpdate.foto_perfil = foto_perfil.trim();
    }

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
    return res
      .status(500)
      .json({ message: "Error al actualizar perfil: " + error.message });
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

export const getUserOrders = async (req, res) => {
  try {
    const { id_usuario, rol } = req.user;

    // Verificar que el usuario sea cliente
    if (rol.toLowerCase() !== "cliente") {
      return res.status(403).json({
        message: "Solo los clientes pueden ver su historial de pedidos",
      });
    }

    // Buscar pedidos del cliente autenticado
    const pedidos = await prisma.pedido.findMany({
      where: {
        id_cliente: id_usuario,
      },
      include: {
        estado: {
          select: { nombre_estado: true },
        },
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    if (pedidos.length === 0) {
      return res.status(404).json({ message: "No hay pedidos registrados" });
    }

    // Formatear respuesta
    const historial = pedidos.map((p) => ({
      id_pedido: p.id_pedido,
      fecha: p.fecha_creacion,
      direccion: p.direccion_destino,
      estado: p.estado?.nombre_estado || "Desconocido",
      total: p.total || 0,
    }));

    return res.json(historial);
  } catch (error) {
    console.error("Error en getUserOrders:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener historial de pedidos" });
  }
};

// POST /api/users/push-token - Registrar token de notificaciones push
export const registerPushToken = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token es requerido" });
    }

    // Actualizar el token push del usuario
    const updatedUser = await prisma.usuario.update({
      where: { id_usuario },
      data: { expo_push_token: token },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        expo_push_token: true,
      },
    });

    console.log(
      `✅ Token push registrado para usuario ${updatedUser.email}: ${token}`
    );

    return res.json({
      message: "Token de notificaciones registrado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error en registerPushToken:", error);
    return res
      .status(500)
      .json({ message: "Error al registrar token de notificaciones" });
  }
};
