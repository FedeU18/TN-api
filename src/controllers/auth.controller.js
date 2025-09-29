import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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

    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No existe un usuario con ese email" });
    }

    //Generar token seguro
    const resetToken = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    //expira en 15 minutos
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15);

    await prisma.usuario.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      },
    });

    //inicio configuración de nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    //Estructura del mail y a quien va dirigido
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de contraseña",
      text: `
        Copia el siguiente token para restablecer tu contraseña. Este token es válido por 15 minutos.
        
        Token: ${resetToken}
        
        Si no solicitaste este cambio, puedes ignorar este correo.
      `,
    };
    //Enviar email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el email:", error);
      } else {
        return res.status(200).json({
          message: "Se envió un enlace de recuperación al correo registrado",
          token: resetToken,
        });
      }
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ message: "Error al recuperar contraseña" });
  }
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.body;

  //verificar si token existe
  if (!token) {
    return res.status(400).json({ message: "Token requerido" });
  }
  //verificar validez del token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.id },
    });

    if (
      !user ||
      user.resetPasswordToken !== token ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res
        .status(400)
        .json({ valid: false, message: "Token inválido o expirado" });
    }

    return res.status(200).json({ valid: true, message: "Token válido" });
  } catch (err) {
    return res
      .status(400)
      .json({ valid: false, message: "Token inválido o expirado" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token y nueva contraseña son requeridos" });
    }

    // Verifico token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Busco usuario
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.id },
    });

    if (
      !user ||
      user.resetPasswordToken !== token ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar y limpiar token
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return res
      .status(200)
      .json({ message: "Contraseña reseteada exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(500).json({ message: "Error al resetear contraseña" });
  }
};
