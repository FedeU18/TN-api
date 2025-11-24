INSERT INTO
  pedido (
    id_repartidor,
    direccion_destino,
    direccion_origen,
    fecha_entrega,
    id_cliente,
    id_estado,
    qr_codigo,
    destino_latitud,
    destino_longitud,
    origen_latitud,
    origen_longitud,
    qr_token
  )
VALUES
  (
    NULL,
    -- aún no asignado a un repartidor
    'Venezuela 1140, Cipolletti, Río Negro',
    'Yrigoyen 379, Cipolletti, Río Negro',
    NULL,
    -- fecha de entrega aún no definida
    18,
    -- id_cliente (cambiá por uno real)
    6,
    -- id_estado (1 = pendiente o asignado según tu sistema)
    NULL,
    -- qr si aún no se generó
    -38.9395124,
    -- destino_latitud
    -67.9756988,
    -- destino_longitud
    -38.9387117,
    -- origen_latitud
    -67.9904295,
    -- origen_longitud
    NULL -- qr_token
  );