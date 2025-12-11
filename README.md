# Jelly Belly Wiki App

Aplicación web fullstack construida con React, Node.js, Express y MongoDB.
En ella se puede registrarse, iniciar sesión y crear, leer, actualizar y eliminar publicaciones.

## Funcionalidades 

- Registro e inicio de sesión de usuarios con autenticación.
- CRUD completo de publicaciones.
- Consumo de la API pública *Jelly Belly Wiki*.
- Frontend en React con JavaScript y Tailwind para estilos.
- Backend en Node.js + Express.
- Base de datos MongoDB y contenedor en Docker.

## Tecnologías utilizadas

- React
- JavaScript (frontend y backend)
- Node.js
- Express
- MongoDB + Mongoose
- JWT para autenticación
- Axios para llamadas HTTP
- Tailwind
- Docker 

## Instalación

- Clona los repositorios:

1-```bash
-git clone https://github.com/Eliig24/Entregable-backend
           https://github.com/Eliig24/Entregable-react

2- Instala dependencias del backend:
cd (archivo backend)
npm install:
cookie-parser
cors
dotenv
express
jsonwebtoken
mongo
mongoose
morgan
nodemailer
nodemon
zod

3- Instala dependencias del frontend:
cd (archivo frontend)
npm install:
-D tailwindcss postcss autoprefixer
react-router-dom

4- Configura las variables de entorno:
- Crea un archivo .env en la raiz backend con las siguientes variables:
NODE_ENV=development
PORT=3000
JWT_SECRET="e0d9362363aee1980348a9dc9c8be5f7"
JWT_REFRESH_SECRET="8b760b20780ce042ff36e43a2bd23be2"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="40m"
DATABASE_URL="mongodb://localhost:27017/Entregable-db"

5- Iniciar los servidores Backend y Frontend:
npm run dev