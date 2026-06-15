'use client';

/**
 * Datos de dirección manejados por el formulario.
 * Subconjunto de {@link import('@/lib/cart-types').DatosEnvioDto} con solo
 * los campos de address (sin nombre, apellido, teléfono).
 */
export interface DatosDireccion {
  calle: string;
  numero: string;
  piso: string;
  departamento: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}

/** Errores por campo del formulario de dirección. */
export type ErroresDireccion = Partial<Record<keyof DatosDireccion, string>>;

interface FormularioDireccionProps {
  /** Valores actuales del formulario. */
  valores: DatosDireccion;
  /** Errores a mostrar (undefined si el campo no fue tocado o es válido). */
  errores: ErroresDireccion;
  /** Conjunto de campos que ya fueron blureados (para gatear errores). */
  tocados: Partial<Record<keyof DatosDireccion, boolean>>;
  /** Se invoca cuando el usuario edita un campo. */
  onChange: (campo: keyof DatosDireccion, valor: string) => void;
  /** Se invoca cuando el usuario pierde el foco de un campo. */
  onBlur: (campo: keyof DatosDireccion) => void;
  /** Si true, los inputs quedan en solo lectura (caso: dirección guardada elegida). */
  soloLectura?: boolean;
}

/**
 * Devuelve el mensaje de error a mostrar para un campo: solo aparece después
 * de que el usuario tocó el campo. Antes de eso, se mantiene oculto para
 * no asustar con errores prematuros.
 */
function mensajeError(
  campo: keyof DatosDireccion,
  tocados: FormularioDireccionProps['tocados'],
  errores: ErroresDireccion,
): string | undefined {
  return tocados[campo] ? errores[campo] : undefined;
}

/**
 * Formulario con los 7 campos estructurados de una dirección:
 * calle, número, piso, departamento, ciudad, provincia y código postal.
 *
 * Es "controlado": el padre maneja el estado, errores y campos tocados.
 * Renderiza los inputs y delega la lógica de validación al padre.
 */
const FormularioDireccion = ({
  valores,
  errores,
  tocados,
  onChange,
  onBlur,
  soloLectura = false,
}: FormularioDireccionProps) => {
  return (
    <>
      <div className="checkout-envio-fila">
        <div className="checkout-envio-campo">
          <label htmlFor="envio-calle">Calle</label>
          <input
            id="envio-calle"
            type="text"
            value={valores.calle}
            onChange={(e) => onChange('calle', e.target.value)}
            onBlur={() => onBlur('calle')}
            placeholder="Ej: Av. Siempre Viva"
            autoComplete="address-line1"
            readOnly={soloLectura}
          />
          {mensajeError('calle', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('calle', tocados, errores)}</span>
          )}
        </div>

        <div className="checkout-envio-campo checkout-envio-campo--corto">
          <label htmlFor="envio-numero">Número</label>
          <input
            id="envio-numero"
            type="text"
            value={valores.numero}
            onChange={(e) => onChange('numero', e.target.value)}
            onBlur={() => onBlur('numero')}
            placeholder="742"
            inputMode="numeric"
            readOnly={soloLectura}
          />
          {mensajeError('numero', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('numero', tocados, errores)}</span>
          )}
        </div>
      </div>

      <div className="checkout-envio-fila">
        <div className="checkout-envio-campo checkout-envio-campo--corto">
          <label htmlFor="envio-piso">Piso (opcional)</label>
          <input
            id="envio-piso"
            type="text"
            value={valores.piso}
            onChange={(e) => onChange('piso', e.target.value)}
            onBlur={() => onBlur('piso')}
            placeholder="3"
            readOnly={soloLectura}
          />
          {mensajeError('piso', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('piso', tocados, errores)}</span>
          )}
        </div>

        <div className="checkout-envio-campo checkout-envio-campo--corto">
          <label htmlFor="envio-depto">Departamento (opcional)</label>
          <input
            id="envio-depto"
            type="text"
            value={valores.departamento}
            onChange={(e) => onChange('departamento', e.target.value)}
            onBlur={() => onBlur('departamento')}
            placeholder="B"
            readOnly={soloLectura}
          />
          {mensajeError('departamento', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('departamento', tocados, errores)}</span>
          )}
        </div>
      </div>

      <div className="checkout-envio-fila">
        <div className="checkout-envio-campo">
          <label htmlFor="envio-ciudad">Ciudad / Localidad</label>
          <input
            id="envio-ciudad"
            type="text"
            value={valores.ciudad}
            onChange={(e) => onChange('ciudad', e.target.value)}
            onBlur={() => onBlur('ciudad')}
            placeholder="Concepción del Uruguay"
            autoComplete="address-level2"
            readOnly={soloLectura}
          />
          {mensajeError('ciudad', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('ciudad', tocados, errores)}</span>
          )}
        </div>

        <div className="checkout-envio-campo checkout-envio-campo--corto">
          <label htmlFor="envio-cp">Código postal</label>
          <input
            id="envio-cp"
            type="text"
            value={valores.codigoPostal}
            onChange={(e) => onChange('codigoPostal', e.target.value)}
            onBlur={() => onBlur('codigoPostal')}
            placeholder="E3260"
            autoComplete="postal-code"
            readOnly={soloLectura}
          />
          {mensajeError('codigoPostal', tocados, errores) && (
            <span className="checkout-envio-error">{mensajeError('codigoPostal', tocados, errores)}</span>
          )}
        </div>
      </div>

      <div className="checkout-envio-campo">
        <label htmlFor="envio-provincia">Provincia</label>
        <input
          id="envio-provincia"
          type="text"
          value={valores.provincia}
          onChange={(e) => onChange('provincia', e.target.value)}
          onBlur={() => onBlur('provincia')}
          placeholder="Entre Ríos"
          autoComplete="address-level1"
          readOnly={soloLectura}
        />
        {mensajeError('provincia', tocados, errores) && (
          <span className="checkout-envio-error">{mensajeError('provincia', tocados, errores)}</span>
        )}
      </div>
    </>
  );
};

export default FormularioDireccion;
