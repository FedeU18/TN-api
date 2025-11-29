-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "id_vendedor" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "public"."Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
