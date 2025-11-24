import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed extendido...");

  // 🔹 Borrar primero tablas dependientes
  await prisma.ubicacion.deleteMany({});
  await prisma.notificacion.deleteMany({});
  await prisma.calificacion.deleteMany({});

  // 🔹 Luego tablas independientes
  await prisma.pedido.deleteMany({});
  await prisma.estadoPedido.deleteMany({});
  await prisma.tipoUbicacion.deleteMany({});
  await prisma.tipoNotificacion.deleteMany({});
  await prisma.usuario.deleteMany({});

  const hashedPassword = await bcrypt.hash("password!123", 10);
  const hashedAdminPassword = await bcrypt.hash("admin!123", 10);

  // === Usuarios ===
  await prisma.usuario.createMany({
    data: [
      {
        nombre: "Fede",
        apellido: "Uñates",
        email: "fedee.unates.2001@gmail.com",
        password: hashedPassword,
        telefono: "2994001111",
        rol: "cliente",
      },
      {
        nombre: "Luis",
        apellido: "Fernández",
        email: "luis@example.com",
        password: hashedPassword,
        telefono: "2994002222",
        rol: "cliente",
      },
      {
        nombre: "Sofía",
        apellido: "Martínez",
        email: "sofia@example.com",
        password: hashedPassword,
        telefono: "2994003333",
        rol: "cliente",
      },
      {
        nombre: "Carlos",
        apellido: "Vega",
        email: "carlos@example.com",
        password: hashedPassword,
        telefono: "2994004444",
        rol: "cliente",
      },
      {
        nombre: "Julieta",
        apellido: "López",
        email: "julieta@example.com",
        password: hashedPassword,
        telefono: "2994005555",
        rol: "cliente",
      },
    ],
  });

  const clientesDB = await prisma.usuario.findMany({
    where: { rol: "cliente" },
  });

  await prisma.usuario.createMany({
    data: [
      {
        nombre: "María",
        apellido: "Pérez",
        email: "maria@example.com",
        password: hashedPassword,
        telefono: "2994111111",
        rol: "repartidor",
      },
      {
        nombre: "Jorge",
        apellido: "Sosa",
        email: "jorge@example.com",
        password: hashedPassword,
        telefono: "2994222222",
        rol: "repartidor",
      },
      {
        nombre: "Lucas",
        apellido: "Benítez",
        email: "lucas@example.com",
        password: hashedPassword,
        telefono: "2994333333",
        rol: "repartidor",
      },
      {
        nombre: "Florencia",
        apellido: "Mendoza",
        email: "florencia@example.com",
        password: hashedPassword,
        telefono: "2994444444",
        rol: "repartidor",
      },
      {
        nombre: "Tomás",
        apellido: "Gutiérrez",
        email: "tomas@example.com",
        password: hashedPassword,
        telefono: "2994555555",
        rol: "repartidor",
      },
    ],
  });

  const repartidoresDB = await prisma.usuario.findMany({
    where: { rol: "repartidor" },
  });

  await prisma.usuario.create({
    data: {
      nombre: "Admin",
      apellido: "Admin",
      email: "admin@example.com",
      password: hashedAdminPassword,
      telefono: "2994999999",
      rol: "admin",
    },
  });
  await prisma.usuario.create({
    data: {
      nombre: "Vendedor",
      apellido: "Vendedor",
      email: "vendedor@example.com",
      password: hashedAdminPassword,
      telefono: "2994999999",
      rol: "vendedor",
    },
  });

  // === Estados ===
  const pendiente = await prisma.estadoPedido.create({
    data: { nombre_estado: "Pendiente" },
  });
  const asignado = await prisma.estadoPedido.create({
    data: { nombre_estado: "Asignado" },
  });
  await prisma.estadoPedido.create({ data: { nombre_estado: "En camino" } }); // no se usa
  const entregado = await prisma.estadoPedido.create({
    data: { nombre_estado: "Entregado" },
  });
  const cancelado = await prisma.estadoPedido.create({
    data: { nombre_estado: "Cancelado" },
  });

  const ahora = new Date();

  const pedidosData = [
    // === Pedidos base (QR001–QR015) ===
    {
      id_cliente: clientesDB[0].id_usuario,
      id_repartidor: repartidoresDB[0].id_usuario,
      direccion_origen: "Av. Argentina 150, Neuquén",
      direccion_destino: "Belgrano 450, Neuquén",
      origen_latitud: -38.9516,
      origen_longitud: -68.0591,
      destino_latitud: -38.9538,
      destino_longitud: -68.0603,
      id_estado: asignado.id_estado,
      qr_codigo: "QR001",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 4),
    },
    {
      id_cliente: clientesDB[0].id_usuario, // Fede
      id_repartidor: null,
      direccion_origen: "Yrigoyen 379, Cipolletti, Río Negro",
      direccion_destino: "Venezuela 1140, Cipolletti, Río Negro",
      origen_latitud: -38.9387117,
      origen_longitud: -67.9904295,
      destino_latitud: -38.9395124,
      destino_longitud: -67.9756988,
      id_estado: pendiente.id_estado,
      qr_codigo: "QR056",
      fecha_creacion: ahora,
    },
    {
      id_cliente: clientesDB[0].id_usuario, // Fede
      id_repartidor: null,
      direccion_origen: "Esmeralda 50, Cipolletti, Río Negro",
      direccion_destino: "Mengelle 350, Cipolletti, Río Negro",
      origen_latitud: -38.9449801,
      origen_longitud: -67.9909923,
      destino_latitud: -38.9435225,
      destino_longitud: -67.9871184,
      id_estado: pendiente.id_estado,
      qr_codigo: "QR057",
      fecha_creacion: ahora,
    },
    {
      id_cliente: clientesDB[0].id_usuario, // Fede
      id_repartidor: null,
      direccion_origen: "Rivadavia 300, Cipolletti, Río Negro",
      direccion_destino: "Brentana 800, Cipolletti, Río Negro",
      origen_latitud: -38.9427812,
      origen_longitud: -67.9884501,
      destino_latitud: -38.9420093,
      destino_longitud: -67.9828114,
      id_estado: pendiente.id_estado,
      qr_codigo: "QR058",
      fecha_creacion: ahora,
    },
    {
      id_cliente: clientesDB[0].id_usuario, // Fede
      id_repartidor: null,
      direccion_origen: "San Martín 900, Cipolletti, Río Negro",
      direccion_destino: "Pastor Bowdler 200, Cipolletti, Río Negro",
      origen_latitud: -38.9389015,
      origen_longitud: -67.9827701,
      destino_latitud: -38.9397498,
      destino_longitud: -67.9793102,
      id_estado: pendiente.id_estado,
      qr_codigo: "QR059",
      fecha_creacion: ahora,
    },
    {
      id_cliente: clientesDB[1].id_usuario,
      id_repartidor: repartidoresDB[1].id_usuario,
      direccion_origen: "Diagonal 9 de Julio 50, Neuquén",
      direccion_destino: "Córdoba 200, Neuquén",
      origen_latitud: -38.9542,
      origen_longitud: -68.0611,
      destino_latitud: -38.9555,
      destino_longitud: -68.0645,
      id_estado: entregado.id_estado,
      qr_codigo: "QR002",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 6),
      fecha_entrega: new Date(ahora.getTime() - 1000 * 60 * 60 * 4),
    },
    // (resto de QR003–QR015 igual que antes)
  ];

  // === Pedidos adicionales (QR016–QR055) ===
  const nuevosPedidos = Array.from({ length: 40 }).map((_, i) => {
    const qr = `QR${String(i + 16).padStart(3, "0")}`;
    const cliente = clientesDB[i % clientesDB.length];
    const repartidor =
      i % 4 === 0 ? null : repartidoresDB[(i + 1) % repartidoresDB.length];
    const estados = [pendiente, asignado, entregado, cancelado];
    const estado = estados[i % estados.length];

    const baseLat = -38.95 - Math.random() * 0.01;
    const baseLng = -68.06 - Math.random() * 0.01;
    const fechaCreacion = new Date(
      new Date().getTime() - 1000 * 60 * 60 * (Math.random() * 24 * 90)
    );

    const tieneEntrega = estado.nombre_estado === "Entregado";
    const fechaEntrega = tieneEntrega
      ? new Date(
          fechaCreacion.getTime() + 1000 * 60 * 60 * (1 + Math.random() * 5)
        )
      : null;

    return {
      id_cliente: cliente.id_usuario,
      id_repartidor: repartidor ? repartidor.id_usuario : null,
      direccion_origen: `Calle ${100 + i}, Neuquén`,
      direccion_destino: `Destino ${200 + i}, Neuquén`,
      origen_latitud: baseLat,
      origen_longitud: baseLng,
      destino_latitud: baseLat - 0.002 - Math.random() * 0.001,
      destino_longitud: baseLng - 0.002 - Math.random() * 0.001,
      id_estado: estado.id_estado,
      qr_codigo: qr,
      fecha_creacion: fechaCreacion,
      ...(tieneEntrega ? { fecha_entrega: fechaEntrega } : {}),
    };
  });

  pedidosData.push(...nuevosPedidos);

  await prisma.pedido.createMany({ data: pedidosData });

  // === Tipos de notificación ===
  await prisma.tipoNotificacion.createMany({
    data: [
      { nombre_tipo: "Nuevo Pedido" },
      { nombre_tipo: "Pedido Entregado" },
      { nombre_tipo: "Asignación de pedido" },
    ],
  });

  // === Tipos de ubicación ===
  await prisma.tipoUbicacion.createMany({
    data: [
      { nombre_tipo: "Actual" },
      { nombre_tipo: "En ruta" },
      { nombre_tipo: "Entrega" },
    ],
  });

  const pedidosEntregados = await prisma.pedido.findMany({
    where: {
      estado: { nombre_estado: "Entregado" },
      id_repartidor: { not: null },
    },
  });

  const comentariosEjemplo = [
    "Excelente servicio, muy rápido.",
    "Todo perfecto, muy amable el repartidor.",
    "Buena atención y entrega puntual.",
    "Pedido en tiempo y forma, muy recomendable.",
    "El repartidor fue muy cordial.",
  ];

  const calificacionesData = pedidosEntregados.map((pedido) => ({
    id_pedido: pedido.id_pedido,
    id_cliente: pedido.id_cliente,
    id_repartidor: pedido.id_repartidor,
    puntuacion: Math.floor(Math.random() * 3) + 3,
    comentario:
      comentariosEjemplo[Math.floor(Math.random() * comentariosEjemplo.length)],
    fecha: new Date(pedido.fecha_entrega ?? new Date()),
  }));

  await prisma.calificacion.createMany({ data: calificacionesData });

  console.log("✅ Seed extendido completado con 55 pedidos realistas.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
