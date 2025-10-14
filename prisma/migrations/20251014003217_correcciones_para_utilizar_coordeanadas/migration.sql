/*
  Warnings:

  - The primary key for the `TipoUbicacion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_estado` on the `TipoUbicacion` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_estado` on the `TipoUbicacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre_tipo]` on the table `TipoUbicacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombre_tipo` to the `TipoUbicacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Ubicacion" DROP CONSTRAINT "Ubicacion_id_tipo_fkey";

-- DropIndex
DROP INDEX "public"."TipoUbicacion_nombre_estado_key";

-- DropIndex
DROP INDEX "public"."Ubicacion_id_pedido_id_tipo_key";

-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "destino_latitud" DECIMAL(10,7),
ADD COLUMN     "destino_longitud" DECIMAL(10,7),
ADD COLUMN     "origen_latitud" DECIMAL(10,7),
ADD COLUMN     "origen_longitud" DECIMAL(10,7);

-- AlterTable
ALTER TABLE "public"."TipoUbicacion" DROP CONSTRAINT "TipoUbicacion_pkey",
DROP COLUMN "id_estado",
DROP COLUMN "nombre_estado",
ADD COLUMN     "id_tipo" SERIAL NOT NULL,
ADD COLUMN     "nombre_tipo" TEXT NOT NULL,
ADD CONSTRAINT "TipoUbicacion_pkey" PRIMARY KEY ("id_tipo");

-- CreateIndex
CREATE UNIQUE INDEX "TipoUbicacion_nombre_tipo_key" ON "public"."TipoUbicacion"("nombre_tipo");

-- AddForeignKey
ALTER TABLE "public"."Ubicacion" ADD CONSTRAINT "Ubicacion_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "public"."TipoUbicacion"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;
