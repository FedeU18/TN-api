import express from "express";
import verifyJWT from "../middlewares/jwt.js";
import {
  obtenerEstadoPago,
  crearPreferenciaPago,
  confirmarPago,
  reembolsarPago,
  procesarWebhookMercadoPago,
  simularPago,
} from "../controllers/pago.controller.js";

const router = express.Router();

// Webhooks públicos
router.post("/webhook", procesarWebhookMercadoPago);
router.post("/confirmar", confirmarPago);

// Rutas protegidas
router.get("/estado/:id_pedido", verifyJWT, obtenerEstadoPago);
router.post("/crear-preferencia/:id_pedido", verifyJWT, crearPreferenciaPago);
router.post("/simular-pago/:id_pedido", verifyJWT, simularPago);
router.post("/reembolsar/:id_pedido", verifyJWT, reembolsarPago);

export default router;
