import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, subject, body, pdfBase64, filename } = req.body;

  if (!email || !subject || !body || !pdfBase64 || !filename) {
    return res.status(400).json({ error: "Faltan parámetros." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      text: body,
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
      ],
    });

    res.status(200).json({ success: true, message: "Correo enviado correctamente." });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({ error: "No se pudo enviar el correo." });
  }
}