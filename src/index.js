import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mainRoutes from './routes/main.routes.js';
import morgan from 'morgan';
import { connectDB } from './db.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({origin: "http://localhost:5173", credentials: true}));
app.use(cookieParser());
app.use(express.json());

morgan.token('body', (req) => JSON.stringify(req.body));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
}

app.use("/api", mainRoutes);

async function startServer() {
    await connectDB();
app.listen(PORT, () => {
    console.log('Servidor corriendo en el puerto 3000');
})
}

startServer();