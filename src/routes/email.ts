import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import axios from 'axios'; // Importa axios para realizar solicitudes HTTP
import dotenv from 'dotenv';

dotenv.config();

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY; 

async function verifyRecaptchaToken(token: string): Promise<boolean> {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );
    const { success, score } = response.data;
    return success && score > 0.5;
  } catch (error) {
    console.error('Error al verificar el token reCAPTCHA:', error);
    return false;
  }
}

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true })); 

router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, email, phone, message, token } = req.body;

    const isRecaptchaValid = await verifyRecaptchaToken(token);
    if (!isRecaptchaValid) {
      return res.status(403).json({ error: 'Token reCAPTCHA no válido' });
    }

    // Validación básica de los datos del formulario
    if (!username || !email || !phone || !message) {
      return res
        .status(400)
        .send('Por favor, complete todos los campos del formulario');
    }

    // Configurar nodemailer para enviar el correo electrónico
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Contenido del correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Nuevo mensaje de contacto',
      text: `
      Nombre: ${username}
      Correo: ${email}
      Teléfono: ${phone}
      Mensaje: ${message}
    `,
    };

    // Envía el correo electrónico
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado exitosamente:', info.response);
    return res.send('Correo electrónico enviado exitosamente');
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return res.status(500).send('Se produjo un error al procesar la solicitud');
  }
});

export default router;
