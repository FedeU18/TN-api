-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "tokenRecuperacion" TEXT,
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;
