/*
  Warnings:

  - A unique constraint covering the columns `[nombre_estado]` on the table `EstadoPedido` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EstadoPedido_nombre_estado_key" ON "public"."EstadoPedido"("nombre_estado");
