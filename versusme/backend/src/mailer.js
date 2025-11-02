import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // puedes usar otro (Outlook, Mailtrap, etc.)
  auth: {
    user: process.env.EMAIL_USER, // tu correo
    pass: process.env.EMAIL_PASS, // tu contraseña o App Password
  },
});

export async function sendVerificationEmail(to, code) {
  const html = `
    <h2>Bienvenido a VersusMe 🎯</h2>
    <p>Tu código de verificación es:</p>
    <h1 style="letter-spacing: 8px;">${code}</h1>
    <p>Este código expirará en 10 minutos.</p>
  `;

  await transporter.sendMail({
    from: `"VersusMe" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Código de verificación - VersusMe",
    html,
  });
}

