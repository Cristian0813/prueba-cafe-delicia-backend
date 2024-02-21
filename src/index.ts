import express from 'express';
import emailRoutes from './routes/email';
import dotenv from 'dotenv';
import cors from 'cors'; // Importa el paquete cors

// Carga las variables de entorno desde el archivo .env
dotenv.config();

const app = express();

app.use(express.json());

const port = process.env.PORT;

// Usa CORS en tu aplicación
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions)); // Aplica el middleware de CORS antes de definir las rutas

app.get('/ping', (_req, res) => {
  console.log('Conectado al ping');
  res.send('pong');
});

app.use('/api/email', emailRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto: ${port}`);
});