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
import repartidorRoutes from "./routes/repartidor.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import soapWrapperRoutes from "./routes/soapWrapper.routes.js";

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
app.use("/api/repartidores", repartidorRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/soap-wrapper", soapWrapperRoutes);

// Proxy para el WSDL y manejo de preflight a través del servidor Express principal
// para evitar bloqueos por CORS desde el navegador
app.options('/wsdl', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');
  return res.sendStatus(204);
});

app.get('/wsdl', (req, res) => {
  // Reenviar la petición al servidor SOAP interno
  const path = req.originalUrl; // includes query string like ?wsdl
  const options = {
    hostname: 'localhost',
    port: 8001,
    path,
    method: 'GET',
    headers: {
      'Origin': req.headers.origin || 'http://localhost:3000'
    }
  };

    const proxy = http.request(options, (proxyRes) => {
    res.statusCode = proxyRes.statusCode;
    // copiar cabeceras del proxy y asegurar CORS
    Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader('Access-Control-Allow-Origin', '*');
    proxyRes.pipe(res);
  });

  proxy.on('error', (err) => {
    console.error('Error proxying WSDL:', err.message);
    res.status(502).json({ error: 'Bad gateway' });
  });

  proxy.end();
});

// Aceptar body en bruto para POST SOAP (evitar que express.json() consuma el XML)
app.post('/wsdl', express.raw({ type: '*/*', limit: '5mb' }), (req, res) => {
  try {
  const bodyBuffer = req.body && Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
  const headers = { ...req.headers };
  // Remove headers that would conflict and set host/content-length correctly
  delete headers['transfer-encoding'];
  delete headers['content-encoding'];
  delete headers['content-length'];
  headers['host'] = 'localhost:8001';
  headers['content-length'] = bodyBuffer.length;

    const options = {
      hostname: 'localhost',
      port: 8001,
      path: '/wsdl',
      method: 'POST',
      headers,
    };

  // Reenviar la petición SOAP al servidor interno en el puerto 8001
    const proxyReq = http.request(options, (proxyRes) => {
      res.statusCode = proxyRes.statusCode;
      Object.entries(proxyRes.headers).forEach(([k, v]) => res.setHeader(k, v));
      res.setHeader('Access-Control-Allow-Origin', '*');

      // If non-success, collect body for debugging
      if (proxyRes.statusCode >= 400) {
        let data = '';
        proxyRes.setEncoding('utf8');
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
          // Devuelve el cuerpo de error tal cual para facilitar debugging cuando ocurra
          console.error('SOAP server error response body:', data);
          res.end(data);
        });
      } else {
        proxyRes.pipe(res, { end: true });
      }
    });

    proxyReq.on('error', (err) => {
      console.error('Error proxying SOAP POST:', err);
      if (!res.headersSent) res.status(502).json({ error: 'Bad gateway' });
    });

    // Write buffer and end
    proxyReq.write(bodyBuffer);
    proxyReq.end();
  } catch (err) {
    console.error('Exception in /wsdl proxy POST:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
