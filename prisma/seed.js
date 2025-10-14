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
        nombre: "Ana",
        apellido: "Gómez",
        email: "ana@example.com",
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

  const repartidores = await prisma.usuario.createMany({
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

  // === Estados de pedido ===
  const pendiente = await prisma.estadoPedido.create({
    data: { nombre_estado: "Pendiente" },
  });
  const asignado = await prisma.estadoPedido.create({
    data: { nombre_estado: "Asignado" },
  });
  const enCamino = await prisma.estadoPedido.create({
    data: { nombre_estado: "En camino" },
  });
  const entregado = await prisma.estadoPedido.create({
    data: { nombre_estado: "Entregado" },
  });
  const cancelado = await prisma.estadoPedido.create({
    data: { nombre_estado: "Cancelado" },
  });

  // === Pedidos ===
  const ahora = new Date();

  const pedidosData = [
    // === Originales ===
    {
      id_cliente: clientesDB[0].id_usuario,
      id_repartidor: repartidoresDB[0].id_usuario,
      direccion_origen: "Av. Argentina 150, Neuquén",
      direccion_destino: "Belgrano 450, Neuquén",
      origen_latitud: -38.9516,
      origen_longitud: -68.0591,
      destino_latitud: -38.9538,
      destino_longitud: -68.0603,
      id_estado: enCamino.id_estado,
      qr_codigo: "QR001",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 4),
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
    {
      id_cliente: clientesDB[2].id_usuario,
      direccion_origen: "Rivadavia 300, Neuquén",
      direccion_destino: "San Martín 900, Neuquén",
      origen_latitud: -38.955,
      origen_longitud: -68.063,
      destino_latitud: -38.9574,
      destino_longitud: -68.0658,
      id_estado: pendiente.id_estado,
      qr_codigo: "QR003",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 3),
    },
    {
      id_cliente: clientesDB[3].id_usuario,
      id_repartidor: repartidoresDB[0].id_usuario,
      direccion_origen: "La Rioja 700, Neuquén",
      direccion_destino: "Leloir 100, Neuquén",
      origen_latitud: -38.9549,
      origen_longitud: -68.0705,
      destino_latitud: -38.9518,
      destino_longitud: -68.0629,
      id_estado: asignado.id_estado,
      qr_codigo: "QR004",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 2),
    },
    {
      id_cliente: clientesDB[4].id_usuario,
      direccion_origen: "Antártida Argentina 1300, Neuquén",
      direccion_destino: "Entre Ríos 250, Neuquén",
      origen_latitud: -38.9579,
      origen_longitud: -68.0712,
      destino_latitud: -38.9525,
      destino_longitud: -68.0624,
      id_estado: pendiente.id_estado,
      qr_codigo: "QR005",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 1),
    },

    // === Nuevos pedidos ===
    {
      id_cliente: clientesDB[0].id_usuario,
      id_repartidor: repartidoresDB[2].id_usuario,
      direccion_origen: "San Martín 100, Neuquén",
      direccion_destino: "Perito Moreno 200, Neuquén",
      origen_latitud: -38.9512,
      origen_longitud: -68.0602,
      destino_latitud: -38.9542,
      destino_longitud: -68.0652,
      id_estado: entregado.id_estado,
      qr_codigo: "QR006",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 30),
      fecha_entrega: new Date(ahora.getTime() - 1000 * 60 * 60 * 28.5),
    },
    {
      id_cliente: clientesDB[2].id_usuario,
      id_repartidor: repartidoresDB[3].id_usuario,
      direccion_origen: "Brown 500, Neuquén",
      direccion_destino: "Salta 800, Neuquén",
      origen_latitud: -38.952,
      origen_longitud: -68.067,
      destino_latitud: -38.955,
      destino_longitud: -68.069,
      id_estado: entregado.id_estado,
      qr_codigo: "QR007",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 50),
      fecha_entrega: new Date(ahora.getTime() - 1000 * 60 * 60 * 47.5),
    },
    {
      id_cliente: clientesDB[1].id_usuario,
      id_repartidor: repartidoresDB[4].id_usuario,
      direccion_origen: "Buenos Aires 100, Neuquén",
      direccion_destino: "Tucumán 700, Neuquén",
      origen_latitud: -38.9523,
      origen_longitud: -68.0661,
      destino_latitud: -38.9562,
      destino_longitud: -68.0691,
      id_estado: entregado.id_estado,
      qr_codigo: "QR008",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 24),
      fecha_entrega: new Date(ahora.getTime() - 1000 * 60 * 60 * 22.3),
    },
    {
      id_cliente: clientesDB[3].id_usuario,
      id_repartidor: repartidoresDB[1].id_usuario,
      direccion_origen: "Independencia 1200, Neuquén",
      direccion_destino: "Mitre 200, Neuquén",
      origen_latitud: -38.953,
      origen_longitud: -68.07,
      destino_latitud: -38.955,
      destino_longitud: -68.06,
      id_estado: cancelado.id_estado,
      qr_codigo: "QR009",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 10),
    },
    {
      id_cliente: clientesDB[0].id_usuario,
      id_repartidor: repartidoresDB[0].id_usuario,
      direccion_origen: "Bahía Blanca 300, Neuquén",
      direccion_destino: "Elordi 600, Neuquén",
      origen_latitud: -38.9518,
      origen_longitud: -68.0655,
      destino_latitud: -38.9537,
      destino_longitud: -68.0623,
      id_estado: entregado.id_estado,
      qr_codigo: "QR010",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 15),
      fecha_entrega: new Date(ahora.getTime() - 1000 * 60 * 60 * 13.8),
    },
    {
      id_cliente: clientesDB[4].id_usuario,
      id_repartidor: repartidoresDB[2].id_usuario,
      direccion_origen: "España 900, Neuquén",
      direccion_destino: "Corrientes 1100, Neuquén",
      origen_latitud: -38.9549,
      origen_longitud: -68.0689,
      destino_latitud: -38.9522,
      destino_longitud: -68.0631,
      id_estado: asignado.id_estado,
      qr_codigo: "QR011",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 8),
    },
    {
      id_cliente: clientesDB[2].id_usuario,
      direccion_origen: "San Juan 450, Neuquén",
      direccion_destino: "Santiago del Estero 700, Neuquén",
      origen_latitud: -38.9558,
      origen_longitud: -68.0613,
      destino_latitud: -38.9539,
      destino_longitud: -68.0667,
      id_estado: pendiente.id_estado,
      qr_codigo: "QR012",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 5),
    },
    {
      id_cliente: clientesDB[1].id_usuario,
      id_repartidor: repartidoresDB[3].id_usuario,
      direccion_origen: "Entre Ríos 500, Neuquén",
      direccion_destino: "Catamarca 100, Neuquén",
      origen_latitud: -38.9542,
      origen_longitud: -68.0623,
      destino_latitud: -38.956,
      destino_longitud: -68.064,
      id_estado: entregado.id_estado,
      qr_codigo: "QR013",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 40),
      fecha_entrega: new Date(ahora.getTime() - 1000 * 60 * 60 * 38.3),
    },
    {
      id_cliente: clientesDB[3].id_usuario,
      id_repartidor: repartidoresDB[0].id_usuario,
      direccion_origen: "Roca 200, Neuquén",
      direccion_destino: "Santa Fe 400, Neuquén",
      origen_latitud: -38.952,
      origen_longitud: -68.063,
      destino_latitud: -38.954,
      destino_longitud: -68.065,
      id_estado: enCamino.id_estado,
      qr_codigo: "QR014",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 3),
    },
    {
      id_cliente: clientesDB[0].id_usuario,
      id_repartidor: repartidoresDB[4].id_usuario,
      direccion_origen: "Italia 800, Neuquén",
      direccion_destino: "Buenos Aires 900, Neuquén",
      origen_latitud: -38.956,
      origen_longitud: -68.067,
      destino_latitud: -38.952,
      destino_longitud: -68.064,
      id_estado: entregado.id_estado,
      qr_codigo: "QR015",
      fecha_creacion: new Date(ahora.getTime() - 1000 * 60 * 60 * 70),
      fecha_entrega: new Date(ahora.getTime() - 1000 * 60 * 60 * 68.2),
    },
  ];

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

  console.log(
    "✅ Seed extendido completado con 15 pedidos y fechas de entrega realistas."
  );
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
