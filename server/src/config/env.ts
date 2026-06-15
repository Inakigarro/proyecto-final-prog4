const VARS_REQUERIDAS = [
  'JWT_SECRET',
  'MONGODB_URI',
  'SUPERADMIN_PASSWORD',
  'FRONTEND_URL',
  // SMTP — usado para enviar emails (reset de contraseña y código de cambio).
  // Configurado para Brevo por defecto; cualquier proveedor SMTP funciona.
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'EMAIL_FROM',
] as const;

export function validarEnv(): void {
  for (const v of VARS_REQUERIDAS) {
    if (!process.env[v]) {
      throw new Error(`Variable de entorno requerida no definida: ${v}`);
    }
  }
}
