import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserOrders,
  registerPushToken,
} from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/jwt.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/me", verifyJWT, getProfile);
router.put("/me", verifyJWT, upload.single("foto"), updateProfile);
router.put("/change-password", verifyJWT, changePassword);
router.get("/me/orders", verifyJWT, getUserOrders);
router.post("/push-token", verifyJWT, registerPushToken);

export default router;
