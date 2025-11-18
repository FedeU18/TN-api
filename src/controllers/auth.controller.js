import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "./sendgrid.controller.js";

const prisma = new PrismaClient();

export const registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;

    //Verificar si ya existe el email
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    //Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        password: hashedPassword,
        telefono,
        rol,
      },
    });

    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Buscar usuario
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email inexistente" });
    }

    //Comparar password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    //Generar token
    const token = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    // Devolver token junto con información del usuario (sin password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login exitoso",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el login" });
  }
};

export const logout = async (req, res) => {
  try {
    const { id_usuario } = req.user;

    //Actualizar estado_sesion
    await prisma.usuario.update({
      where: { id_usuario },
      data: { estado_sesion: false },
    });

    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No existe un usuario con ese email" });
    }

    // Generar código de 4 dígitos (1000 - 9999)
    const resetCode = Math.floor(1000 + Math.random() * 9000);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // Expira en 10 min

    // Guardar en la BD
    await prisma.usuario.update({
      where: { email },
      data: {
        resetPasswordToken: resetCode,
        resetPasswordExpires: expiresAt,
      },
    });

    // Enviar email
    await sendEmail({
      to: email,
      subject: "Código de recuperación de contraseña",
      text: `
      Tu código de recuperación es: ${resetCode}

      Este código es válido por 10 minutos.
      Si no solicitaste este cambio, podés ignorar este correo.
      `,
    });

    return res.status(200).json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ message: "Error al recuperar contraseña" });
  }
};

export const verifyResetToken = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res
      .status(400)
      .json({ valid: false, message: "Email y código requeridos" });
  }

  const user = await prisma.usuario.findUnique({ where: { email } });

  if (
    !user ||
    user.resetPasswordToken !== Number(code) ||
    !user.resetPasswordExpires ||
    user.resetPasswordExpires < new Date()
  ) {
    return res
      .status(400)
      .json({ valid: false, message: "Código inválido o expirado" });
  }

  return res.status(200).json({ valid: true, message: "Código válido" });
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, código y nueva contraseña requeridos" });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (
      !user ||
      user.resetPasswordToken !== Number(code) ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar y limpiar código
    await prisma.usuario.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return res
      .status(200)
      .json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(500).json({ message: "Error al resetear contraseña" });
  }
};
