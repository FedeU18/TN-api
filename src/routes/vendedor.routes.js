import { Router } from "express";
import { 
  crearPedidoVendedor,
  getMisPedidosVendedor,
  getDetallePedidoVendedor
} from "../controllers/vendedor.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = Router();

router.post("/crear-pedido", verifyJWT, crearPedidoVendedor);
router.get("/mis-pedidos", verifyJWT, getMisPedidosVendedor);
router.get("/pedido/:id_pedido", verifyJWT, getDetallePedidoVendedor);

export default router;
