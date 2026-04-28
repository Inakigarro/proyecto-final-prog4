type Nivel = 'info' | 'warn' | 'error' | 'debug';

interface EntradaLog {
  timestamp: string;
  nivel: Nivel;
  mensaje: string;
  contexto?: Record<string, unknown>;
}

function log(nivel: Nivel, mensaje: string, contexto?: Record<string, unknown>): void {
  const entrada: EntradaLog = {
    timestamp: new Date().toISOString(),
    nivel,
    mensaje,
    ...(contexto && { contexto }),
  };

  const salida = JSON.stringify(entrada);

  if (nivel === 'error') {
    console.error(salida);
  } else if (nivel === 'warn') {
    console.warn(salida);
  } else {
    console.log(salida);
  }
}

export const logger = {
  info:  (mensaje: string, contexto?: Record<string, unknown>) => log('info',  mensaje, contexto),
  warn:  (mensaje: string, contexto?: Record<string, unknown>) => log('warn',  mensaje, contexto),
  error: (mensaje: string, contexto?: Record<string, unknown>) => log('error', mensaje, contexto),
  debug: (mensaje: string, contexto?: Record<string, unknown>) => log('debug', mensaje, contexto),
};
