import express from "express";
import {
  getPedidosDisponibles,
  getMisPedidos,
  tomarPedido,
  asignarPedido,
  monitorPedido,
  actualizarEstadoPedido,
} from "../controllers/pedido.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = express.Router();

router.get("/disponibles", verifyJWT, getPedidosDisponibles);
router.get("/mis-pedidos", verifyJWT, getMisPedidos);
router.get("/:id", verifyJWT, monitorPedido);
router.put("/tomar/:id", verifyJWT, tomarPedido);
router.put("/asignar/:id", verifyJWT, asignarPedido);
router.put("/estado/:id", verifyJWT, actualizarEstadoPedido);

export default router;
