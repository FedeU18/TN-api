/*
  Warnings:

  - A unique constraint covering the columns `[nombre_estado]` on the table `TipoUbicacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TipoUbicacion_nombre_estado_key" ON "public"."TipoUbicacion"("nombre_estado");
