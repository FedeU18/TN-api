// src/routes/auth.routes.js
import { Router } from "express";
import {
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth route is working");
});

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
