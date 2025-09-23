// src/routes/health.routes.js
import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/db-check", async (req, res) => {
  try {
    // Ejemplo: contar usuarios
    const count = await prisma.usuario.count(); // Asegurate de tener el modelo `usuario` en tu schema
    res.json({ status: "ok", usuarios: count });
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    res.status(500).json({
      status: "error",
      message: "No se pudo conectar con la base de datos",
    });
  }
});

export default router;
