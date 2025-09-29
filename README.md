# Endpoints

## AUTH

- login: post http://localhost:3000/api/auth/login
- registro: post http://localhost:3000/api/auth/registro
- olvido contraseña: post http://localhost:3000/api/auth/forgot-password
- verificar token: post http://localhost:3000/api/auth/verify-reset-token
- resetear contraseña: post http://localhost:3000/api/auth/reset-password

## USER

- perfil: get http://localhost:3000/api/users/me
- actualizar perfil: put http://localhost:3000/api/users/me
- cambiar contraseña: put http://localhost:3000/api/users/change-password
