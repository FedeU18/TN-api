/*
  Warnings:

  - You are about to alter the column `latitud` on the `Ubicacion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,7)`.
  - You are about to alter the column `longitud` on the `Ubicacion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,7)`.
  - A unique constraint covering the columns `[id_pedido,id_tipo]` on the table `Ubicacion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Ubicacion" ALTER COLUMN "latitud" SET DATA TYPE DECIMAL(10,7),
ALTER COLUMN "longitud" SET DATA TYPE DECIMAL(10,7);

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_id_pedido_id_tipo_key" ON "public"."Ubicacion"("id_pedido", "id_tipo");
