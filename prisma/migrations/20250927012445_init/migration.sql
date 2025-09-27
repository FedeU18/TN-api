-- CreateTable
CREATE TABLE "public"."TipoUbicacion" (
    "id_tipo_ubicacion" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoUbicacion_pkey" PRIMARY KEY ("id_tipo_ubicacion")
);

-- CreateTable
CREATE TABLE "public"."Ubicacion" (
    "id_ubicacion" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "id_tipo_ubicacion" INTEGER NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id_ubicacion")
);

-- CreateTable
CREATE TABLE "public"."EstadoPedido" (
    "id_estado_pedido" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EstadoPedido_pkey" PRIMARY KEY ("id_estado_pedido")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "coordenadas" TEXT NOT NULL,
    "id_ubicacion" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."Repartidor" (
    "id_repartidor" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "coordenadas" TEXT NOT NULL,
    "id_ubicacion" INTEGER NOT NULL,

    CONSTRAINT "Repartidor_pkey" PRIMARY KEY ("id_repartidor")
);

-- CreateTable
CREATE TABLE "public"."Pedido" (
    "id_pedido" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_estado_pedido" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "fecha_hora_entrega" TIMESTAMP(3) NOT NULL,
    "id_repartidor" INTEGER NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "public"."TipoProducto" (
    "id_tipo_producto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoProducto_pkey" PRIMARY KEY ("id_tipo_producto")
);

-- CreateTable
CREATE TABLE "public"."Producto" (
    "id_producto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "id_tipo_producto" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "public"."PedidoProducto" (
    "id_pedido_producto" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "PedidoProducto_pkey" PRIMARY KEY ("id_pedido_producto")
);

-- CreateTable
CREATE TABLE "public"."Calificacion" (
    "id_calificacion" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_repartidor" INTEGER NOT NULL,
    "calificacion_usuario" INTEGER NOT NULL,
    "calificacion_repartidor" INTEGER NOT NULL,
    "comentario_usuario" TEXT NOT NULL,
    "comentario_repartidor" TEXT NOT NULL,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("id_calificacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "public"."Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Repartidor_correo_key" ON "public"."Repartidor"("correo");

-- AddForeignKey
ALTER TABLE "public"."Ubicacion" ADD CONSTRAINT "Ubicacion_id_tipo_ubicacion_fkey" FOREIGN KEY ("id_tipo_ubicacion") REFERENCES "public"."TipoUbicacion"("id_tipo_ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "public"."Ubicacion"("id_ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repartidor" ADD CONSTRAINT "Repartidor_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "public"."Ubicacion"("id_ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_id_estado_pedido_fkey" FOREIGN KEY ("id_estado_pedido") REFERENCES "public"."EstadoPedido"("id_estado_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pedido" ADD CONSTRAINT "Pedido_id_repartidor_fkey" FOREIGN KEY ("id_repartidor") REFERENCES "public"."Repartidor"("id_repartidor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Producto" ADD CONSTRAINT "Producto_id_tipo_producto_fkey" FOREIGN KEY ("id_tipo_producto") REFERENCES "public"."TipoProducto"("id_tipo_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PedidoProducto" ADD CONSTRAINT "PedidoProducto_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "public"."Pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PedidoProducto" ADD CONSTRAINT "PedidoProducto_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calificacion" ADD CONSTRAINT "Calificacion_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "public"."Pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calificacion" ADD CONSTRAINT "Calificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calificacion" ADD CONSTRAINT "Calificacion_id_repartidor_fkey" FOREIGN KEY ("id_repartidor") REFERENCES "public"."Repartidor"("id_repartidor") ON DELETE RESTRICT ON UPDATE CASCADE;
