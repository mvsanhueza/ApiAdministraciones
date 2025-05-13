import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Configuración para usar Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS, // Usar una "app password" de Google
  },
})

export async function POST(request: Request) {
  try {
    // Procesar el JSON para obtener los campos y el archivo en base64
    const data = await request.json()
    const { to, subject, message, filename ,attachment } = data

    // Validar los datos recibidos
    if (!to || !subject || !message) {
      return NextResponse.json({ message: "Faltan campos requeridos: to, subject, message" }, { status: 400 })
    }

    // console.log({process.env.GMAIL_USER, process.env.GMAIL_APP_PASSWORD,})

    // Configurar las opciones del correo
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
    }

    // Añadir el archivo adjunto si existe
    if (attachment) {
      // El attachment ya viene como un objeto con filename y content (base64)
      mailOptions.attachments = [
        {
          filename: filename,
          content: attachment, // Ya está en formato base64 con el prefijo data URI
          encoding: "base64",
        },
      ]
    }

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions)

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Email enviado correctamente",
        details: {
          to,
          subject,
          timestamp: new Date().toISOString(),
          messageId: info.messageId,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al enviar email:", error)
    return NextResponse.json(
      {
        message: "Error al procesar la solicitud de envío de email",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
