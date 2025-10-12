import express from "express";
import verifyJWT from "../middlewares/jwt.js";
import { enviarUbicacion } from "../controllers/repartidor.controller.js";

const router = express.Router();

// POST /api/repartidores/ubicacion
router.post("/ubicacion", verifyJWT, enviarUbicacion);

export default router;
