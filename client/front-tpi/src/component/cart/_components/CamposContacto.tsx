'use client';

/**
 * Datos de contacto del receptor del envío: nombre, apellido y teléfono.
 * No incluyen la dirección — esa la maneja {@link FormularioDireccion}.
 */
export interface DatosContacto {
  nombre: string;
  apellido: string;
  telefono: string;
}

/** Errores por campo del formulario de contacto. */
export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;

interface CamposContactoProps {
  valores: DatosContacto;
  errores: ErroresContacto;
  tocados: Partial<Record<keyof DatosContacto, boolean>>;
  onChange: (campo: keyof DatosContacto, valor: string) => void;
  onBlur: (campo: keyof DatosContacto) => void;
}

/**
 * Devuelve el error a mostrar para un campo solo si el usuario ya lo tocó.
 */
function mensajeError(
  campo: keyof DatosContacto,
  tocados: CamposContactoProps['tocados'],
  errores: ErroresContacto,
): string | undefined {
  return tocados[campo] ? errores[campo] : undefined;
}

/**
 * Subformulario con los datos de contacto del receptor del envío.
 * Es controlado: el padre maneja estado, errores y campos tocados.
 */
const CamposContacto = ({ valores, errores, tocados, onChange, onBlur }: CamposContactoProps) => {
  return (
    <>
      <div className="checkout-envio-fila">
        <div className="checkout-envio-campo">
          <label htmlFor="envio-nombre">Nombre</label>
          <input
            id="envio-nombre"
            type="text"
            value={valores.nombre}
            onChange={(e) => onChange('nombre', e.target.value)}
            onBlur={() => onBlur('nombre')}
            placeholder="Tu nombre"
            autoComplete="given-name"
          />
          {mensajeError('nombre', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('nombre', tocados, errores)}</span>
          )}
        </div>

        <div className="checkout-envio-campo">
          <label htmlFor="envio-apellido">Apellido</label>
          <input
            id="envio-apellido"
            type="text"
            value={valores.apellido}
            onChange={(e) => onChange('apellido', e.target.value)}
            onBlur={() => onBlur('apellido')}
            placeholder="Tu apellido"
            autoComplete="family-name"
          />
          {mensajeError('apellido', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('apellido', tocados, errores)}</span>
          )}
        </div>
      </div>

      <div className="checkout-envio-campo">
        <label htmlFor="envio-telefono">Teléfono</label>
        <input
          id="envio-telefono"
          type="tel"
          value={valores.telefono}
          onChange={(e) => onChange('telefono', e.target.value)}
          onBlur={() => onBlur('telefono')}
          placeholder="Ej: 3442401234"
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
        />
        <span className="checkout-envio-ayuda">
          10 dígitos: código de área + número, sin 0 ni 15
        </span>
        {mensajeError('telefono', tocados, errores) && (
          <span className="checkout-envio-error">{mensajeError('telefono', tocados, errores)}</span>
        )}
      </div>
    </>
  );
};

export default CamposContacto;
