/*
  Warnings:

  - You are about to drop the column `calificacion_repartidor` on the `Calificacion` table. All the data in the column will be lost.
  - You are about to drop the column `calificacion_usuario` on the `Calificacion` table. All the data in the column will be lost.
  - You are about to drop the column `comentario_repartidor` on the `Calificacion` table. All the data in the column will be lost.
  - You are about to drop the column `comentario_usuario` on the `Calificacion` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `Calificacion` table. All the data in the column will be lost.
  - The primary key for the `EstadoPedido` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_estado_pedido` on the `EstadoPedido` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `EstadoPedido` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora_entrega` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `id_estado_pedido` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `Pedido` table. All the data in the column will be lost.
  - The primary key for the `TipoUbicacion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_tipo_ubicacion` on the `TipoUbicacion` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `TipoUbicacion` table. All the data in the column will be lost.
  - You are about to drop the column `id_tipo_ubicacion` on the `Ubicacion` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Ubicacion` table. All the data in the column will be lost.
  - You are about to drop the column `coordenadas` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `correo` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `id_ubicacion` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `tokenRecuperacion` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `verificado` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `PedidoProducto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Producto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Repartidor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipoProducto` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_pedido]` on the table `Calificacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `comentario` to the `Calificacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `Calificacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `puntuacion` to the `Calificacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_estado` to the `EstadoPedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion_destino` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion_origen` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_estado` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qr_codigo` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_estado` to the `TipoUbicacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_pedido` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_tipo` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitud` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitud` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `telefono` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Calificacion" DROP CONSTRAINT "Calificacion_id_repartidor_fkey";

-- DropForeignKey
ALTER TABLE "public"."Calificacion" DROP CONSTRAINT "Calificacion_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Pedido" DROP CONSTRAINT "Pedido_id_estado_pedido_fkey";

-- DropForeignKey
ALTER TABLE "public"."Pedido" DROP CONSTRAINT "Pedido_id_repartidor_fkey";

-- DropForeignKey
ALTER TABLE "public"."Pedido" DROP CONSTRAINT "Pedido_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."PedidoProducto" DROP CONSTRAINT "PedidoProducto_id_pedido_fkey";

-- DropForeignKey
ALTER TABLE "public"."PedidoProducto" DROP CONSTRAINT "PedidoProducto_id_producto_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_id_tipo_producto_fkey";

-- DropForeignKey
ALTER TABLE "public"."Repartidor" DROP CONSTRAINT "Repartidor_id_ubicacion_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ubicacion" DROP CONSTRAINT "Ubicacion_id_tipo_ubicacion_fkey";

-- DropForeignKey
ALTER TABLE "public"."Usuario" DROP CONSTRAINT "Usuario_id_ubicacion_fkey";

-- DropIndex
DROP INDEX "public"."Usuario_correo_key";

-- AlterTable
ALTER TABLE "public"."Calificacion" DROP COLUMN "calificacion_repartidor",
DROP COLUMN "calificacion_usuario",
DROP COLUMN "comentario_repartidor",
DROP COLUMN "comentario_usuario",
DROP COLUMN "id_usuario",
ADD COLUMN     "comentario" TEXT NOT NULL,
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_cliente" INTEGER NOT NULL,
ADD COLUMN     "puntuacion" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."EstadoPedido" DROP CONSTRAINT "EstadoPedido_pkey",
DROP COLUMN "id_estado_pedido",
DROP COLUMN "nombre",
ADD COLUMN     "id_estado" SERIAL NOT NULL,
ADD COLUMN     "nombre_estado" TEXT NOT NULL,
ADD CONSTRAINT "EstadoPedido_pkey" PRIMARY KEY ("id_estado");

-- AlterTable
ALTER TABLE "public"."Pedido" DROP COLUMN "fecha_hora",
DROP COLUMN "fecha_hora_entrega",
DROP COLUMN "id_estado_pedido",
DROP COLUMN "id_usuario",
ADD COLUMN     "direccion_destino" TEXT NOT NULL,
ADD COLUMN     "direccion_origen" TEXT NOT NULL,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_entrega" TIMESTAMP(3),
ADD COLUMN     "id_cliente" INTEGER NOT NULL,
ADD COLUMN     "id_estado" INTEGER NOT NULL,
ADD COLUMN     "qr_codigo" TEXT NOT NULL,
ALTER COLUMN "id_repartidor" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."TipoUbicacion" DROP CONSTRAINT "TipoUbicacion_pkey",
DROP COLUMN "id_tipo_ubicacion",
DROP COLUMN "nombre",
ADD COLUMN     "id_estado" SERIAL NOT NULL,
ADD COLUMN     "nombre_estado" TEXT NOT NULL,
ADD CONSTRAINT "TipoUbicacion_pkey" PRIMARY KEY ("id_estado");

-- AlterTable
ALTER TABLE "public"."Ubicacion" DROP COLUMN "id_tipo_ubicacion",
DROP COLUMN "nombre",
ADD COLUMN     "id_pedido" INTEGER NOT NULL,
ADD COLUMN     "id_tipo" INTEGER NOT NULL,
ADD COLUMN     "latitud" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "longitud" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "coordenadas",
DROP COLUMN "correo",
DROP COLUMN "createdAt",
DROP COLUMN "direccion",
DROP COLUMN "id_ubicacion",
DROP COLUMN "tokenRecuperacion",
DROP COLUMN "updatedAt",
DROP COLUMN "verificado",
ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "estado_sesion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "foto_perfil" TEXT,
ADD COLUMN     "rol" TEXT NOT NULL,
DROP COLUMN "telefono",
ADD COLUMN     "telefono" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."PedidoProducto";

-- DropTable
DROP TABLE "public"."Producto";

-- DropTable
DROP TABLE "public"."Repartidor";

-- DropTable
DROP TABLE "public"."TipoProducto";

-- CreateTable
CREATE TABLE "public"."TipoNotificacion" (
    "id_tipo" SERIAL NOT NULL,
    "nombre_tipo" TEXT NOT NULL,

    CONSTRAINT "TipoNotificacion_pkey" PRIMARY KEY ("id_tipo")
);

-- CreateTable
CREATE TABLE "public"."Notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "mensaje" TEXT NOT NULL,
    "id_tipo" INTEGER NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_id_pedido_key" ON "public"."Calificacion"("id_pedido");

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_id_repartidor_fkey" FOREIGN KEY ("id_repartidor") REFERENCES "public"."Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "public"."EstadoPedido"("id_estado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ubicacion" ADD CONSTRAINT "Ubicacion_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "public"."Pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ubicacion" ADD CONSTRAINT "Ubicacion_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "public"."TipoUbicacion"("id_estado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calificacion" ADD CONSTRAINT "Calificacion_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calificacion" ADD CONSTRAINT "Calificacion_id_repartidor_fkey" FOREIGN KEY ("id_repartidor") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "public"."Pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "public"."TipoNotificacion"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;
