/*
  Warnings:

  - A unique constraint covering the columns `[nombre_tipo]` on the table `TipoNotificacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TipoNotificacion_nombre_tipo_key" ON "public"."TipoNotificacion"("nombre_tipo");
