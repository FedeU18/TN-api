// src/routes/auth.routes.js
import { Router } from "express";
import {
  login,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  registro,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth route is working");
});

router.post("/registro", registro);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

export default router;
