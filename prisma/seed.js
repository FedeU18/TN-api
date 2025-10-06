import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed extendido...");

  const hashedPassword = await bcrypt.hash("password!123", 10);
  const hashedAdminPassword = await bcrypt.hash("admin!123", 10);

  // === Usuarios ===
  const clientes = await prisma.usuario.createMany({
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
  const pedidos = await prisma.pedido.createMany({
    data: [
      {
        id_cliente: 1,
        direccion_origen: "Calle 123",
        direccion_destino: "Av. 456",
        id_estado: pendiente.id_estado,
        qr_codigo: "QR001",
      },
      {
        id_cliente: 2,
        direccion_origen: "Boulevard 789",
        direccion_destino: "Ruta 101",
        id_estado: pendiente.id_estado,
        qr_codigo: "QR002",
      },
      {
        id_cliente: 3,
        direccion_origen: "Mitre 555",
        direccion_destino: "San Martín 900",
        id_estado: pendiente.id_estado,
        qr_codigo: "QR003",
      },
      {
        id_cliente: 4,
        direccion_origen: "Libertad 222",
        direccion_destino: "Belgrano 800",
        id_estado: enCamino.id_estado,
        qr_codigo: "QR004",
      },
      {
        id_cliente: 5,
        direccion_origen: "Italia 300",
        direccion_destino: "España 1000",
        id_estado: entregado.id_estado,
        qr_codigo: "QR005",
      },
    ],
  });

  // === Tipos de notificación ===
  const tipoNuevo = await prisma.tipoNotificacion.upsert({
    where: { nombre_tipo: "Nuevo Pedido" },
    update: {},
    create: { nombre_tipo: "Nuevo Pedido" },
  });
  const tipoEntrega = await prisma.tipoNotificacion.upsert({
    where: { nombre_tipo: "Pedido Entregado" },
    update: {},
    create: { nombre_tipo: "Pedido Entregado" },
  });
  const tipoAsignacion = await prisma.tipoNotificacion.upsert({
    where: { nombre_tipo: "Asignación de pedido" },
    update: {},
    create: { nombre_tipo: "Asignación de pedido" },
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
