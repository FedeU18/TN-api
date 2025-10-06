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

## PEDIDOS

- obtener pedidos disponibles: GET http://localhost:3000/api/pedidos/disponibles
- asignar pedido: PUT http://localhost:3000/api/pedidos/asignar/:id
