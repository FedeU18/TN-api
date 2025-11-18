import { Router } from "express";
import { crearPedidoVendedor } from "../controllers/vendedor.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = Router();

router.post("/crear-pedido", verifyJWT, crearPedidoVendedor);

export default router;
