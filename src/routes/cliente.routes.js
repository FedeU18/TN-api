import express from "express";
import {
  obtenerPedidosCliente,
  obtenerDetallePedidoCliente,
  obtenerPedidosSinCalificar,
  getAllClientes,
} from "../controllers/cliente.controller.js";
import verifyJWT from "../middlewares/jwt.js";
const router = express.Router();

router.get("/", verifyJWT, getAllClientes);
router.get("/pedidos", verifyJWT, obtenerPedidosCliente);
router.get("/pedidos/sin-calificar", verifyJWT, obtenerPedidosSinCalificar);
router.get("/pedidos/:id_pedido", verifyJWT, obtenerDetallePedidoCliente);

export default router;
