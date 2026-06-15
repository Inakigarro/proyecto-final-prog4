import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../../config/logger';

/**
 * Transporter SMTP perezoso. Se construye en la primera llamada para que el
 * servidor pueda arrancar aunque falten las variables de email (útil mientras
 * se trabaja en flujos que no envían correos).
 *
 * Configurado para Brevo (smtp-relay.brevo.com:587) pero funciona contra
 * cualquier proveedor SMTP: solo cambian las variables de entorno.
 */
let _transporter: Transporter | null = null;

function obtenerTransporter(): Transporter {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    throw new Error(
      'Faltan variables SMTP. Definí SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASSWORD en el .env.'
    );
  }

  _transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    // Puerto 587 + STARTTLS es lo estándar; 465 sería SSL implícito
    secure: Number(port) === 465,
    auth: { user, pass: password },
  });

  return _transporter;
}

/**
 * Devuelve el remitente configurado en EMAIL_FROM, p.ej. "TechPoint <noreply@dominio.com>".
 * Lanza si no está definido para fallar fuerte en vez de mandar desde un from por defecto.
 */
function obtenerRemitente(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error('EMAIL_FROM no está definida. Configurala en el .env con el sender verificado en Brevo.');
  }
  return from;
}

/**
 * Envía el email de recuperación de contraseña con el enlace que contiene el token.
 * El token expira en 1 hora (definido en el modelo PasswordResetToken).
 */
export async function enviarEmailResetPassword(
  destinatario: string,
  token: string
): Promise<void> {
  const enlace = `${process.env.FRONTEND_URL}/recuperar-contrasena?token=${token}`;

  await obtenerTransporter().sendMail({
    from: obtenerRemitente(),
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

/**
 * Envía el código de verificación (6 dígitos) para confirmar el cambio de
 * contraseña iniciado desde el perfil. El código expira en 5 minutos y se
 * valida en POST /api/auth/password/change/confirm.
 *
 * En desarrollo el código también se loggea por consola para poder probar
 * el flujo sin depender del email.
 */
export async function enviarEmailCodigoCambioPassword(
  destinatario: string,
  codigo: string
): Promise<void> {
  // Loggeamos siempre el código: en un TP es útil para debug y demos.
  // En producción real, este log debería removerse o gatearse por NODE_ENV.
  logger.info('Código de cambio de password generado', { destinatario, codigo });

  await obtenerTransporter().sendMail({
    from: obtenerRemitente(),
    to: destinatario,
    subject: 'Código de verificación — TechPoint',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1c2826;">Confirmá el cambio de contraseña</h2>
        <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta en TechPoint.</p>
        <p>Ingresá el siguiente código para confirmar el cambio. El código es válido por <strong>5 minutos</strong>.</p>
        <div
          style="
            margin: 24px 0;
            padding: 20px;
            background-color: #f5efe8;
            border: 1px solid #cc9476;
            border-radius: 8px;
            text-align: center;
            font-family: monospace;
            font-size: 32px;
            letter-spacing: 8px;
            font-weight: bold;
            color: #1c2826;
          "
        >
          ${codigo}
        </div>
        <p style="color: #888; font-size: 13px;">
          Si no solicitaste este cambio, ignorá este email. Tu contraseña no será modificada.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">TechPoint — Tecnicatura en Programación</p>
      </div>
    `,
  });
}

/**
 * Email de bienvenida que se envía después de crear una cuenta exitosamente.
 * Es informativo: confirma el alta y orienta al usuario hacia los primeros pasos.
 */
export async function enviarEmailBienvenida(
  destinatario: string,
  nombre: string
): Promise<void> {
  const enlaceHome = process.env.FRONTEND_URL ?? '#';

  await obtenerTransporter().sendMail({
    from: obtenerRemitente(),
    to: destinatario,
    subject: '¡Bienvenido a TechPoint!',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1c2826;">¡Hola ${nombre}, te damos la bienvenida!</h2>
        <p>Tu cuenta en TechPoint se creó correctamente. Ya podés iniciar sesión y empezar a explorar nuestro catálogo.</p>
        <p>Algunos puntos para arrancar:</p>
        <ul style="color: #2e3a37; padding-left: 20px;">
          <li>Revisá nuestras promociones activas para no perderte ninguna oferta.</li>
          <li>Desde "Mi perfil" podés cargar tu teléfono y administrar tus direcciones.</li>
          <li>Si te olvidás la contraseña, podés recuperarla desde la pantalla de login.</li>
        </ul>
        <a
          href="${enlaceHome}"
          style="
            display: inline-block;
            margin: 24px 0;
            padding: 12px 24px;
            background-color: #566965;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Ir a TechPoint
        </a>
        <p style="color: #888; font-size: 13px;">
          Si no creaste vos esta cuenta, contactanos a la brevedad para que podamos revisarlo.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">TechPoint — Tecnicatura en Programación</p>
      </div>
    `,
  });
}

/**
 * Email informativo que se envía después de confirmar exitosamente un cambio
 * de contraseña. Sirve como aviso al usuario: si recibe este mail sin haberlo
 * solicitado, sabe que tiene que reaccionar (probablemente le robaron el acceso).
 */
export async function enviarEmailCambioPasswordExitoso(
  destinatario: string,
  nombre: string
): Promise<void> {
  const enlaceLogin = `${process.env.FRONTEND_URL ?? '#'}/login`;

  await obtenerTransporter().sendMail({
    from: obtenerRemitente(),
    to: destinatario,
    subject: 'Tu contraseña fue actualizada — TechPoint',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1c2826;">Hola ${nombre}, cambiamos tu contraseña</h2>
        <p>Te avisamos que la contraseña de tu cuenta en TechPoint fue actualizada hace unos instantes.</p>
        <p>Por seguridad, todas las sesiones abiertas en otros dispositivos fueron cerradas.</p>
        <div
          style="
            margin: 24px 0;
            padding: 16px;
            background-color: #fff5ec;
            border-left: 4px solid #cc9476;
            border-radius: 4px;
            color: #2e3a37;
            font-size: 14px;
          "
        >
          <strong>¿No fuiste vos?</strong> Cambiá la contraseña inmediatamente desde la opción "Olvidé mi contraseña" y contactanos para revisarlo.
        </div>
        <a
          href="${enlaceLogin}"
          style="
            display: inline-block;
            margin: 12px 0;
            padding: 12px 24px;
            background-color: #566965;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          "
        >
          Ir a iniciar sesión
        </a>
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
    from: obtenerRemitente(),
    to: destinatario,
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