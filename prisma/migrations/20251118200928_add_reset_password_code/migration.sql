/*
  Warnings:

  - The `resetPasswordToken` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "resetPasswordToken",
ADD COLUMN     "resetPasswordToken" INTEGER;
