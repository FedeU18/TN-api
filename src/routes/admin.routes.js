import express from "express";
import { getReporteDesempeno } from "../controllers/reporte.controller.js";
import verifyJWT from "../middlewares/jwt.js";

import {
  getAllUsers,
  getRepartidoresConCalificaciones,
  updateUserRol,
  getCalificacionesDeRepartidor,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/reportes/desempeno", verifyJWT, getReporteDesempeno);

// Usuarios
router.get("/usuarios", verifyJWT, getAllUsers);
router.put("/usuarios/:id/rol", verifyJWT, updateUserRol);

// Repartidores + calificaciones
router.get("/repartidores/calificaciones", verifyJWT, getRepartidoresConCalificaciones);
router.get("/repartidores/:id/calificaciones", verifyJWT, getCalificacionesDeRepartidor);

export default router;
