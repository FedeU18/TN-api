-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "estado_pago" TEXT DEFAULT 'pendiente',
ADD COLUMN     "fecha_pago" TIMESTAMP(3),
ADD COLUMN     "id_transaccion_pago" TEXT,
ADD COLUMN     "metodo_pago" TEXT,
ADD COLUMN     "monto_pedido" DECIMAL(10,2);
