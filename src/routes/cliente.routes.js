import express from "express";
import {
  obtenerPedidosCliente,
  obtenerDetallePedidoCliente,
} from "../controllers/cliente.controller.js";
import verifyJWT from "../middlewares/jwt.js";
const router = express.Router();

router.get("/pedidos", verifyJWT, obtenerPedidosCliente);
router.get("/pedidos/:id_pedido", verifyJWT, obtenerDetallePedidoCliente);

export default router;
