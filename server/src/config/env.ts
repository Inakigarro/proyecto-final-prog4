const VARS_REQUERIDAS = ['JWT_SECRET', 'MONGODB_URI', 'SUPERADMIN_PASSWORD'] as const;

export function validarEnv(): void {
  for (const v of VARS_REQUERIDAS) {
    if (!process.env[v]) {
      throw new Error(`Variable de entorno requerida no definida: ${v}`);
    }
  }
}
