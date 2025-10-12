// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import logger from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pedidoRoutes from "./routes/pedido.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//Crear servidor HTTP y vincular Socket.IO
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*", // Podés limitarlo a tu frontend
    methods: ["GET", "POST", "PUT"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger("dev"));

//Middleware para compartir el socket con las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/admin", adminRoutes);

// Manejo de errores
app.use(errorHandler);

// WebSockets
io.on("connection", (socket) => {
  console.log(`🟢 Usuario conectado: ${socket.id}`);

  // Un cliente se une a un pedido específico
  socket.on("joinPedido", (pedidoId) => {
    socket.join(`pedido_${pedidoId}`);
    console.log(`📦 Usuario ${socket.id} se unió al pedido ${pedidoId}`);
    console.log("Rooms actuales:", socket.rooms);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Usuario desconectado: ${socket.id}`);
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
