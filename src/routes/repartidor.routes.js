import express from "express";
import verifyJWT from "../middlewares/jwt.js";
import {
  enviarUbicacion,
  obtenerUbicacion,
} from "../controllers/repartidor.controller.js";

const router = express.Router();

router.post("/ubicacion", verifyJWT, enviarUbicacion);
router.get("/ubicacion/:id_pedido", verifyJWT, obtenerUbicacion);
export default router;
