import express from "express";
import {
  getPedidosDisponibles,
  getMisPedidos,
  tomarPedido,
  asignarPedido,
  monitorPedido,
  actualizarEstadoPedido,
  getAllPedidos,
  obtenerUbicacionRepartidor,
  guardarUbicacionRepartidor,
} from "../controllers/pedido.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = express.Router();

router.get("/", verifyJWT, getAllPedidos);
router.get("/disponibles", verifyJWT, getPedidosDisponibles);
router.get("/mis-pedidos", verifyJWT, getMisPedidos);
router.get("/:id", verifyJWT, monitorPedido);
router.put("/tomar/:id", verifyJWT, tomarPedido);
router.put("/asignar/:id", verifyJWT, asignarPedido);
router.get("/monitor/:id", verifyJWT, monitorPedido);
router.put("/estado/:id", verifyJWT, actualizarEstadoPedido);
router.get("/:id/ubicacion", verifyJWT, obtenerUbicacionRepartidor);
router.post("/:id/ubicacion", verifyJWT, guardarUbicacionRepartidor);

export default router;
