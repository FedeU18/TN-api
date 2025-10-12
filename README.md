# Endpoints

## AUTH

- login: POST http://localhost:3000/api/auth/login
- registro: POST http://localhost:3000/api/auth/registro
- olvido contraseña: POST http://localhost:3000/api/auth/forgot-password
- verificar token: POST http://localhost:3000/api/auth/verify-reset-token
- resetear contraseña: POST http://localhost:3000/api/auth/reset-password

## USER

- perfil: GET http://localhost:3000/api/users/me
- actualizar perfil: PUT http://localhost:3000/api/users/me
- cambiar contraseña: PUT http://localhost:3000/api/users/change-password
- Historial de pedidos: GET http://localhost:3000/api/users/me/orders

## PEDIDOS

- obtener pedidos disponibles: GET http://localhost:3000/api/pedidos/disponibles
- asignar pedido: PUT http://localhost:3000/api/pedidos/asignar/:id
- tomar pedido: PUT http://localhost:3000/api/pedidos/tomar/:id
- monitorear estado de pedido: GET http://localhost:3000/api/pedidos/monitor/:id
- actualizar estado de pedido: PUT http://localhost:3000/api/pedidos/estado/:id
- obtener pedidos asignados a un repartidor: GET http://localhost:3000/api/pedidos/estado/mis-pedidos
- obtener pedidos asignados a un repartidor: GET http://localhost:3000/api/pedidos/estado/mis-pedidos

## Cliente

- obtener todos sus pedidos: GET http://localhost:3000/api/clientes/pedidos
- obtener detalle de un pedido: GET http://localhost:3000/api/clientes/pedidos/:id

## Repartidor

- obtener ubicación del repartidor en un pedido: GET http://localhost:3000/api/repartidores/ubicacion/:id_pedido
- actualizar ubicación del repartidor en un pedido: PUT http://localhost:3000/api/repartidores/ubicacion
