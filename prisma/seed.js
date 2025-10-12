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
  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: "Ana",
      apellido: "Gómez",
      email: "ana@example.com",
      password: hashedPassword,
      telefono: "2994001111",
      rol: "cliente",
    },
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: "Luis",
      apellido: "Fernández",
      email: "luis@example.com",
      password: hashedPassword,
      telefono: "2994002222",
      rol: "cliente",
    },
  });

  const cliente3 = await prisma.usuario.create({
    data: {
      nombre: "Sofía",
      apellido: "Martínez",
      email: "sofia@example.com",
      password: hashedPassword,
      telefono: "2994003333",
      rol: "cliente",
    },
  });

  const cliente4 = await prisma.usuario.create({
    data: {
      nombre: "Carlos",
      apellido: "Vega",
      email: "carlos@example.com",
      password: hashedPassword,
      telefono: "2994004444",
      rol: "cliente",
    },
  });

  const cliente5 = await prisma.usuario.create({
    data: {
      nombre: "Julieta",
      apellido: "López",
      email: "julieta@example.com",
      password: hashedPassword,
      telefono: "2994005555",
      rol: "cliente",
    },
  });

  const repartidor1 = await prisma.usuario.create({
    data: {
      nombre: "María",
      apellido: "Pérez",
      email: "maria@example.com",
      password: hashedPassword,
      telefono: "2994111111",
      rol: "repartidor",
    },
  });

  const repartidor2 = await prisma.usuario.create({
    data: {
      nombre: "Jorge",
      apellido: "Sosa",
      email: "jorge@example.com",
      password: hashedPassword,
      telefono: "2994222222",
      rol: "repartidor",
    },
  });

  await prisma.usuario.createMany({
    data: [
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

  const admin = await prisma.usuario.create({
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
  const pendiente = await prisma.estadoPedido.upsert({
    where: { nombre_estado: "Pendiente" },
    update: {},
    create: { nombre_estado: "Pendiente" },
  });
  const asignado = await prisma.estadoPedido.upsert({
    where: { nombre_estado: "Asignado" },
    update: {},
    create: { nombre_estado: "Asignado" },
  });
  const enCamino = await prisma.estadoPedido.upsert({
    where: { nombre_estado: "En camino" },
    update: {},
    create: { nombre_estado: "En camino" },
  });
  const entregado = await prisma.estadoPedido.upsert({
    where: { nombre_estado: "Entregado" },
    update: {},
    create: { nombre_estado: "Entregado" },
  });

  // === Pedidos ===
  await prisma.pedido.createMany({
    data: [
      {
        id_cliente: cliente1.id_usuario,
        direccion_origen: "Calle 123",
        direccion_destino: "Av. 456",
        id_estado: pendiente.id_estado,
        qr_codigo: "QR001",
        id_repartidor: null,
      },
      {
        id_cliente: cliente2.id_usuario,
        direccion_origen: "Boulevard 789",
        direccion_destino: "Ruta 101",
        id_estado: pendiente.id_estado,
        qr_codigo: "QR002",
        id_repartidor: null,
      },
      {
        id_cliente: cliente3.id_usuario,
        direccion_origen: "Mitre 555",
        direccion_destino: "San Martín 900",
        id_estado: pendiente.id_estado,
        qr_codigo: "QR003",
        id_repartidor: null,
      },
      {
        id_cliente: cliente4.id_usuario,
        direccion_origen: "Libertad 222",
        direccion_destino: "Belgrano 800",
        id_estado: enCamino.id_estado,
        qr_codigo: "QR004",
        id_repartidor: repartidor1.id_usuario,
      },
      {
        id_cliente: cliente5.id_usuario,
        direccion_origen: "Italia 300",
        direccion_destino: "España 1000",
        id_estado: entregado.id_estado,
        qr_codigo: "QR005",
        id_repartidor: repartidor2.id_usuario,
      },
    ],
  });

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
      { nombre_estado: "Actual" },
      { nombre_estado: "En ruta" },
      { nombre_estado: "Entrega" },
    ],
  });

  console.log("✅ Seed extendido completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });