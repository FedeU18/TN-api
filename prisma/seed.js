import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Hashear contraseñas
  const hashedPassword = await bcrypt.hash("password!123", 10);
  const hashedAdminPassword = await bcrypt.hash("admin!123", 10);

  // 1. Usuarios
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

  const admin1 = await prisma.usuario.create({
    data: {
      nombre: "Admin",
      apellido: "Admin",
      email: "admin@example.com",
      password: hashedAdminPassword,
      telefono: "2994999999",
      rol: "admin",
    },
  });

  // 2. Estados de pedido
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

  // 3. Pedidos
  const pedido1 = await prisma.pedido.create({
    data: {
      id_cliente: cliente1.id_usuario,
      id_repartidor: repartidor1.id_usuario,
      direccion_origen: "Calle 123",
      direccion_destino: "Av. 456",
      id_estado: pendiente.id_estado,
      qr_codigo: "QR001",
    },
  });

  const pedido2 = await prisma.pedido.create({
    data: {
      id_cliente: cliente2.id_usuario,
      id_repartidor: repartidor2.id_usuario,
      direccion_origen: "Boulevard 789",
      direccion_destino: "Ruta 101",
      id_estado: enCamino.id_estado,
      qr_codigo: "QR002",
    },
  });

  // 4. Tipos de notificación
  const tipoNuevo = await prisma.tipoNotificacion.create({
    data: { nombre_tipo: "Nuevo Pedido" },
  });

  const tipoEntrega = await prisma.tipoNotificacion.create({
    data: { nombre_tipo: "Pedido Entregado" },
  });

  // 5. Notificaciones
  await prisma.notificacion.create({
    data: {
      id_pedido: pedido1.id_pedido,
      id_usuario: repartidor1.id_usuario,
      mensaje: "Tienes un nuevo pedido asignado",
      id_tipo: tipoNuevo.id_tipo,
    },
  });

  await prisma.notificacion.create({
    data: {
      id_pedido: pedido2.id_pedido,
      id_usuario: repartidor2.id_usuario,
      mensaje: "El pedido está en camino",
      id_tipo: tipoEntrega.id_tipo,
    },
  });

  // 6. Calificaciones
  await prisma.calificacion.create({
    data: {
      id_pedido: pedido1.id_pedido,
      id_cliente: cliente1.id_usuario,
      id_repartidor: repartidor1.id_usuario,
      puntuacion: 5,
      comentario: "Muy rápido y amable",
    },
  });

  await prisma.calificacion.create({
    data: {
      id_pedido: pedido2.id_pedido,
      id_cliente: cliente2.id_usuario,
      id_repartidor: repartidor2.id_usuario,
      puntuacion: 4,
      comentario: "Buen servicio, pero tardó un poco",
    },
  });

  console.log("✅ Seed completado con datos genéricos.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
