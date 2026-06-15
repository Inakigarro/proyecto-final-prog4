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

const EMAIL_FROM = process.env.EMAIL_FROM ?? 'TechPoint <noreply@techpoint.com>';

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
    from: EMAIL_FROM,
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

// ── Email de confirmación de compra ───────────────────────────────────────

interface DetalleItemEmail {
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  monto: number;
}

export interface DatosEmailConfirmacion {
  ordenId: string;
  destinatario: string;
  nombreCompleto: string;
  direccion: string;
  telefono: string;
  marcaTarjeta: string;
  ultimos4: string;
  detalles: DetalleItemEmail[];
  montoTotal: number;
  fechaCreacion: Date;
}

/**
 * Envía el email de confirmación de compra con el detalle de la orden.
 * Si el envío falla, loguea el error pero no interrumpe el checkout
 * (la orden ya se creó exitosamente).
 */
export async function enviarEmailConfirmacionCompra(
  datos: DatosEmailConfirmacion
): Promise<void> {
  const filasProductos = datos.detalles
    .map(
      (d) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${d.nombreItem}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">${d.cantidad}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${d.precioUnitario.toLocaleString('es-AR')}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">$${d.monto.toLocaleString('es-AR')}</td>
      </tr>`
    )
    .join('');

  const fecha = datos.fechaCreacion.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const ordenCorta = datos.ordenId.slice(-8).toUpperCase();

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: datos.destinatario,
    subject: `Confirmación de compra #${ordenCorta} — TechPoint`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #2e3a37;">
        <h2 style="color: #1c2826; margin-bottom: 4px;">¡Gracias por tu compra!</h2>
        <p style="color: #888; font-size: 14px; margin-top: 0;">Orden #${ordenCorta} · ${fecha}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <h3 style="font-size: 14px; color: #566965; margin-bottom: 12px;">Productos</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f5f5f3;">
              <th style="padding: 8px 12px; text-align: left;">Producto</th>
              <th style="padding: 8px 12px; text-align: center;">Cant.</th>
              <th style="padding: 8px 12px; text-align: right;">P. Unit.</th>
              <th style="padding: 8px 12px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${filasProductos}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 16px; font-size: 18px; font-weight: bold; color: #1c2826;">
          Total: $${datos.montoTotal.toLocaleString('es-AR')}
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <h3 style="font-size: 14px; color: #566965; margin-bottom: 8px;">Datos de envío</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.6;">
          ${datos.nombreCompleto}<br />
          ${datos.direccion}<br />
          Tel: ${datos.telefono}
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <h3 style="font-size: 14px; color: #566965; margin-bottom: 8px;">Método de pago</h3>
        <p style="margin: 0; font-size: 14px;">
          ${datos.marcaTarjeta} terminada en ****${datos.ultimos4}
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <p style="color: #aaa; font-size: 12px; text-align: center;">
          TechPoint — Tecnicatura en Programación
        </p>
      </div>
    `,
  });
}