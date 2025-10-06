import express from "express";
import { getReporteDesempeno } from "../controllers/reporte.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = express.Router();

router.get("/reportes/desempeno", verifyJWT, getReporteDesempeno);

export default router;
