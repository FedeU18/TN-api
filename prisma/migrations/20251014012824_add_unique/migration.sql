/*
  Warnings:

  - A unique constraint covering the columns `[id_pedido,id_tipo]` on the table `Ubicacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_id_pedido_id_tipo_key" ON "public"."Ubicacion"("id_pedido", "id_tipo");
