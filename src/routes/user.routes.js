import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = express.Router();

router.get("/me", verifyJWT, getProfile);
router.put("/me", verifyJWT, updateProfile);
router.put("/change-password", verifyJWT, changePassword);

export default router;
