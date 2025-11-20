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
  verificarQR,
  obtenerQR,
  getHistorialEntregas,
  getHistorialPedidos,
} from "../controllers/pedido.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = express.Router();

router.get("/", verifyJWT, getAllPedidos);
router.get("/disponibles", verifyJWT, getPedidosDisponibles);
router.get("/mis-pedidos", verifyJWT, getMisPedidos);
router.get("/historial/entregas", verifyJWT, getHistorialEntregas);
router.get("/historial/pedidos", verifyJWT, getHistorialPedidos);
router.get("/:id", verifyJWT, monitorPedido);
router.put("/tomar/:id", verifyJWT, tomarPedido);
router.put("/asignar/:id", verifyJWT, asignarPedido);
router.get("/monitor/:id", verifyJWT, monitorPedido);
router.put("/estado/:id", verifyJWT, actualizarEstadoPedido);
router.get("/:id/ubicacion", verifyJWT, obtenerUbicacionRepartidor);
router.post("/:id/ubicacion", verifyJWT, guardarUbicacionRepartidor);
router.get("/verificar-qr/:id", verificarQR);
router.get("/:id/qr", obtenerQR);

export default router;
