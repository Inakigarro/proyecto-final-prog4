'use client';

/**
 * Formulario de datos de envío (paso 1 del checkout).
 *
 * Recibe valores iniciales (del perfil del usuario) y notifica al padre
 * cada vez que los datos cambian, indicando si el formulario es válido.
 */

import { useState, useEffect, useCallback } from 'react';
import type { DatosEnvioDto } from '@/lib/cart-types';
import './CheckoutEnvioForm.css';

interface CheckoutEnvioFormProps {
  /** Valores iniciales para pre-cargar (del perfil del usuario). */
  valoresIniciales?: Partial<DatosEnvioDto>;
  /** Se llama cada vez que cambian los datos o la validez del formulario. */
  onChange: (datos: DatosEnvioDto, esValido: boolean) => void;
}

interface ErroresCampo {
  nombre?: string;
  apellido?: string;
  direccion?: string;
  telefono?: string;
}

/**
 * Valida un campo individual y devuelve el mensaje de error o undefined si es válido.
 */
function validarCampo(campo: keyof DatosEnvioDto, valor: string): string | undefined {
  const v = valor.trim();
  switch (campo) {
    case 'nombre':
      if (!v) return 'El nombre es obligatorio';
      if (v.length < 2) return 'Mínimo 2 caracteres';
      return undefined;
    case 'apellido':
      if (!v) return 'El apellido es obligatorio';
      if (v.length < 2) return 'Mínimo 2 caracteres';
      return undefined;
    case 'direccion':
      if (!v) return 'La dirección es obligatoria';
      if (v.length < 5) return 'Mínimo 5 caracteres';
      return undefined;
    case 'telefono':
      if (!v) return 'El teléfono es obligatorio';
      if (!/^\d+$/.test(v)) return 'Solo números';
      if (v.length !== 10) return 'Debe tener 10 dígitos (cód. área + número)';
      return undefined;
  }
}

const CheckoutEnvioForm = ({ valoresIniciales, onChange }: CheckoutEnvioFormProps) => {
  const [form, setForm] = useState<DatosEnvioDto>({
    nombre: valoresIniciales?.nombre ?? '',
    apellido: valoresIniciales?.apellido ?? '',
    direccion: valoresIniciales?.direccion ?? '',
    telefono: valoresIniciales?.telefono ?? '',
  });

  /** Errores solo se muestran después de que el usuario tocó el campo. */
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [errores, setErrores] = useState<ErroresCampo>({});

  /**
   * Recalcula errores y notifica al padre cada vez que cambia el form.
   */
  const notificarCambio = useCallback(
    (datos: DatosEnvioDto) => {
      const nuevosErrores: ErroresCampo = {
        nombre: validarCampo('nombre', datos.nombre),
        apellido: validarCampo('apellido', datos.apellido),
        direccion: validarCampo('direccion', datos.direccion),
        telefono: validarCampo('telefono', datos.telefono),
      };
      setErrores(nuevosErrores);

      const esValido = Object.values(nuevosErrores).every((e) => e === undefined);
      onChange(datos, esValido);
    },
    [onChange]
  );

  /** Notificar al montar con los valores iniciales. */
  useEffect(() => {
    notificarCambio(form);
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (campo: keyof DatosEnvioDto, valor: string) => {
    // Para teléfono, solo permitir dígitos
    const valorFinal = campo === 'telefono' ? valor.replace(/\D/g, '').slice(0, 10) : valor;

    const nuevoForm = { ...form, [campo]: valorFinal };
    setForm(nuevoForm);
    notificarCambio(nuevoForm);
  };

  const handleBlur = (campo: keyof DatosEnvioDto) => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
  };

  const mostrarError = (campo: keyof DatosEnvioDto): string | undefined => {
    return tocados[campo] ? errores[campo] : undefined;
  };

  return (
    <div className="checkout-envio">
      <h3 className="checkout-envio-titulo">Datos de envío</h3>
      <p className="checkout-envio-subtitulo">
        Completá tus datos para recibir el pedido.
      </p>

      <div className="checkout-envio-fila">
        <div className="checkout-envio-campo">
          <label htmlFor="envio-nombre">Nombre</label>
          <input
            id="envio-nombre"
            type="text"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            onBlur={() => handleBlur('nombre')}
            placeholder="Tu nombre"
            autoComplete="given-name"
          />
          {mostrarError('nombre') && (
            <span className="checkout-envio-error">{mostrarError('nombre')}</span>
          )}
        </div>

        <div className="checkout-envio-campo">
          <label htmlFor="envio-apellido">Apellido</label>
          <input
            id="envio-apellido"
            type="text"
            value={form.apellido}
            onChange={(e) => handleChange('apellido', e.target.value)}
            onBlur={() => handleBlur('apellido')}
            placeholder="Tu apellido"
            autoComplete="family-name"
          />
          {mostrarError('apellido') && (
            <span className="checkout-envio-error">{mostrarError('apellido')}</span>
          )}
        </div>
      </div>

      <div className="checkout-envio-campo">
        <label htmlFor="envio-direccion">Dirección</label>
        <input
          id="envio-direccion"
          type="text"
          value={form.direccion}
          onChange={(e) => handleChange('direccion', e.target.value)}
          onBlur={() => handleBlur('direccion')}
          placeholder="Calle, número, piso, depto."
          autoComplete="street-address"
        />
        {mostrarError('direccion') && (
          <span className="checkout-envio-error">{mostrarError('direccion')}</span>
        )}
      </div>

      <div className="checkout-envio-campo">
        <label htmlFor="envio-telefono">Teléfono</label>
        <input
          id="envio-telefono"
          type="tel"
          value={form.telefono}
          onChange={(e) => handleChange('telefono', e.target.value)}
          onBlur={() => handleBlur('telefono')}
          placeholder="Ej: 3442401234"
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
        />
        <span className="checkout-envio-ayuda">
          10 dígitos: código de área + número, sin 0 ni 15
        </span>
        {mostrarError('telefono') && (
          <span className="checkout-envio-error">{mostrarError('telefono')}</span>
        )}
      </div>
    </div>
  );
};

export default CheckoutEnvioForm;