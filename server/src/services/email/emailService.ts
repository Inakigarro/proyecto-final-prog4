import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Envía el email de recuperación de contraseña con el enlace que contiene el token.
 * El token expira en 1 hora (definido en el modelo PasswordResetToken).
 */
export async function enviarEmailResetPassword(
  destinatario: string,
  token: string
): Promise<void> {
  const enlace = `${process.env.FRONTEND_URL}/recuperar-contrasena?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'TechPoint <noreply@techpoint.com>',
    to: destinatario,
    subject: 'Recuperación de contraseña — TechPoint',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1c2826;">Recuperá tu contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en TechPoint.</p>
        <p>Hacé clic en el botón para crear una nueva contraseña. El enlace es válido por <strong>1 hora</strong>.</p>
        <a
          href="${enlace}"
          style="
            display: inline-block;
            margin: 24px 0;
            padding: 12px 24px;
            background-color: #cc9476;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Restablecer contraseña
        </a>
        <p style="color: #888; font-size: 13px;">
          Si no solicitaste este cambio, podés ignorar este email. Tu contraseña no será modificada.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">TechPoint — Tecnicatura en Programación</p>
      </div>
    `,
  });
}
