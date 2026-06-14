'use client';

/**
 * Formulario de pago con tarjeta de crédito (paso 2 del checkout).
 *
 * Detecta la marca de la tarjeta por BIN (primeros dígitos),
 * valida el número con el algoritmo de Luhn, y notifica al padre
 * cuando los datos son válidos.
 *
 * Incluye tarjetas de prueba con datos dummy para facilitar el testing.
 */

import { useState, useEffect, useCallback } from 'react';
import type { DatosTarjetaDto } from '@/lib/cart-types';
import './CheckoutPagoForm.css';

interface CheckoutPagoFormProps {
  /** Se llama cada vez que cambian los datos o la validez del formulario. */
  onChange: (datos: DatosTarjetaDto, esValido: boolean) => void;
}

// ── Tarjetas de prueba (dummy) ────────────────────────────────────────────

interface TarjetaPrueba {
  marca: string;
  numero: string;
  titular: string;
  vencimiento: string;
  cvv: string;
  color: string;
}

const TARJETAS_PRUEBA: TarjetaPrueba[] = [
  {
    marca: 'Visa',
    numero: '4242424242424242',
    titular: 'JUAN PEREZ',
    vencimiento: '12/28',
    cvv: '123',
    color: '#1a1f71',
  },
  {
    marca: 'Visa',
    numero: '4000056655665556',
    titular: 'MARIA GARCIA',
    vencimiento: '06/29',
    cvv: '456',
    color: '#1a1f71',
  },
  {
    marca: 'Mastercard',
    numero: '5425233430109903',
    titular: 'CARLOS LOPEZ',
    vencimiento: '09/27',
    cvv: '789',
    color: '#eb001b',
  },
  {
    marca: 'Mastercard',
    numero: '2223000048410010',
    titular: 'ANA MARTINEZ',
    vencimiento: '03/28',
    cvv: '321',
    color: '#eb001b',
  },
  {
    marca: 'Amex',
    numero: '374245455400126',
    titular: 'ROBERTO FERNANDEZ',
    vencimiento: '11/27',
    cvv: '1234',
    color: '#006fcf',
  },
];

// ── Detección de marca por BIN ────────────────────────────────────────────

interface MarcaTarjeta {
  nombre: string;
  patron: RegExp;
  longitudes: number[];
  cvvLength: number;
  color: string;
}

const MARCAS: MarcaTarjeta[] = [
  {
    nombre: 'Visa',
    patron: /^4/,
    longitudes: [16],
    cvvLength: 3,
    color: '#1a1f71',
  },
  {
    nombre: 'Mastercard',
    patron: /^(5[1-5]|2[2-7])/,
    longitudes: [16],
    cvvLength: 3,
    color: '#eb001b',
  },
  {
    nombre: 'Amex',
    patron: /^3[47]/,
    longitudes: [15],
    cvvLength: 4,
    color: '#006fcf',
  },
  {
    nombre: 'Diners',
    patron: /^(30[0-5]|36|38)/,
    longitudes: [14],
    cvvLength: 3,
    color: '#004a97',
  },
];

function detectarMarca(numero: string): MarcaTarjeta | null {
  const soloDigitos = numero.replace(/\D/g, '');
  if (soloDigitos.length < 1) return null;
  return MARCAS.find((m) => m.patron.test(soloDigitos)) ?? null;
}

// ── Validación Luhn ───────────────────────────────────────────────────────

function validarLuhn(numero: string): boolean {
  const digitos = numero.replace(/\D/g, '');
  if (digitos.length < 13) return false;

  let suma = 0;
  let alternar = false;

  for (let i = digitos.length - 1; i >= 0; i--) {
    let n = parseInt(digitos[i], 10);
    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    suma += n;
    alternar = !alternar;
  }

  return suma % 10 === 0;
}

// ── Formato visual ────────────────────────────────────────────────────────

function formatearNumero(valor: string, marca: MarcaTarjeta | null): string {
  const digitos = valor.replace(/\D/g, '');
  const maxLen = marca?.longitudes[0] ?? 16;
  const limitado = digitos.slice(0, maxLen);

  if (marca?.nombre === 'Amex') {
    const partes = [limitado.slice(0, 4), limitado.slice(4, 10), limitado.slice(10, 15)];
    return partes.filter(Boolean).join(' ');
  }

  const partes: string[] = [];
  for (let i = 0; i < limitado.length; i += 4) {
    partes.push(limitado.slice(i, i + 4));
  }
  return partes.join(' ');
}

function formatearVencimiento(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return digitos.slice(0, 2) + '/' + digitos.slice(2);
}

// ── Componente ────────────────────────────────────────────────────────────

interface FormPago {
  numero: string;
  titular: string;
  vencimiento: string;
  cvv: string;
}

interface ErroresPago {
  numero?: string;
  titular?: string;
  vencimiento?: string;
  cvv?: string;
}

const CheckoutPagoForm = ({ onChange }: CheckoutPagoFormProps) => {
  const [form, setForm] = useState<FormPago>({
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: '',
  });
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [errores, setErrores] = useState<ErroresPago>({});
  const [mostrarPruebas, setMostrarPruebas] = useState(false);

  const marca = detectarMarca(form.numero);
  const cvvMax = marca?.cvvLength ?? 3;

  const notificarCambio = useCallback(
    (datos: FormPago, marcaActual: MarcaTarjeta | null) => {
      const soloDigitos = datos.numero.replace(/\D/g, '');
      const longitudEsperada = marcaActual?.longitudes[0] ?? 16;
      const cvvMaxActual = marcaActual?.cvvLength ?? 3;

      const nuevosErrores: ErroresPago = {};

      if (!soloDigitos) {
        nuevosErrores.numero = 'El número de tarjeta es obligatorio';
      } else if (soloDigitos.length < longitudEsperada) {
        nuevosErrores.numero = `Debe tener ${longitudEsperada} dígitos`;
      } else if (!validarLuhn(soloDigitos)) {
        nuevosErrores.numero = 'El número de tarjeta no es válido';
      }

      if (!datos.titular.trim()) {
        nuevosErrores.titular = 'El titular es obligatorio';
      } else if (datos.titular.trim().length < 3) {
        nuevosErrores.titular = 'Mínimo 3 caracteres';
      }

      const vencDigitos = datos.vencimiento.replace(/\D/g, '');
      if (!vencDigitos) {
        nuevosErrores.vencimiento = 'Obligatorio';
      } else if (vencDigitos.length < 4) {
        nuevosErrores.vencimiento = 'Formato MM/AA';
      } else {
        const mes = parseInt(vencDigitos.slice(0, 2), 10);
        const anio = parseInt('20' + vencDigitos.slice(2, 4), 10);
        const ahora = new Date();
        const anioActual = ahora.getFullYear();
        const mesActual = ahora.getMonth() + 1;

        if (mes < 1 || mes > 12) {
          nuevosErrores.vencimiento = 'Mes inválido';
        } else if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
          nuevosErrores.vencimiento = 'Tarjeta vencida';
        }
      }

      if (!datos.cvv) {
        nuevosErrores.cvv = 'Obligatorio';
      } else if (datos.cvv.length !== cvvMaxActual) {
        nuevosErrores.cvv = `${cvvMaxActual} dígitos`;
      }

      setErrores(nuevosErrores);

      const esValido = Object.values(nuevosErrores).every((e) => e === undefined);
      const ultimos4 = soloDigitos.slice(-4);

      onChange(
        {
          marca: marcaActual?.nombre ?? 'Desconocida',
          ultimos4: ultimos4.padStart(4, '0'),
        },
        esValido
      );
    },
    [onChange]
  );

  useEffect(() => {
    notificarCambio(form, marca);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (campo: keyof FormPago, valor: string) => {
    let valorFinal = valor;

    switch (campo) {
      case 'numero':
        valorFinal = formatearNumero(valor, detectarMarca(valor));
        break;
      case 'vencimiento':
        valorFinal = formatearVencimiento(valor);
        break;
      case 'cvv':
        valorFinal = valor.replace(/\D/g, '').slice(0, cvvMax);
        break;
      case 'titular':
        valorFinal = valor.toUpperCase();
        break;
    }

    const nuevoForm = { ...form, [campo]: valorFinal };
    setForm(nuevoForm);

    const nuevaMarca = campo === 'numero' ? detectarMarca(valorFinal) : marca;
    notificarCambio(nuevoForm, nuevaMarca);
  };

  const handleBlur = (campo: keyof FormPago) => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
  };

  const mostrarError = (campo: keyof FormPago): string | undefined => {
    return tocados[campo] ? errores[campo] : undefined;
  };

  /** Auto-completa el formulario con una tarjeta de prueba. */
  const usarTarjetaPrueba = (tarjeta: TarjetaPrueba) => {
    const marcaDetectada = detectarMarca(tarjeta.numero);
    const nuevoForm: FormPago = {
      numero: formatearNumero(tarjeta.numero, marcaDetectada),
      titular: tarjeta.titular,
      vencimiento: tarjeta.vencimiento,
      cvv: tarjeta.cvv,
    };
    setForm(nuevoForm);
    setTocados({ numero: true, titular: true, vencimiento: true, cvv: true });
    setMostrarPruebas(false);
    notificarCambio(nuevoForm, marcaDetectada);
  };

  return (
    <div className="checkout-pago">
      <div className="checkout-pago-header">
        <div>
          <h3 className="checkout-pago-titulo">Datos de pago</h3>
          <p className="checkout-pago-subtitulo">
            Ingresá los datos de tu tarjeta de crédito.
          </p>
        </div>
        <button
          type="button"
          className="checkout-pago-btn-pruebas"
          onClick={() => setMostrarPruebas(!mostrarPruebas)}
        >
          {mostrarPruebas ? 'Cerrar' : 'Tarjetas de prueba'}
        </button>
      </div>

      {/* ── Selector de tarjetas de prueba ─────────────────────────────── */}
      {mostrarPruebas && (
        <div className="checkout-pago-pruebas">
          <p className="checkout-pago-pruebas-titulo">
            Seleccioná una tarjeta para auto-completar:
          </p>
          {TARJETAS_PRUEBA.map((t, i) => (
            <button
              key={i}
              type="button"
              className="checkout-pago-prueba-card"
              onClick={() => usarTarjetaPrueba(t)}
            >
              <span
                className="checkout-pago-prueba-dot"
                style={{ background: t.color }}
              />
              <span className="checkout-pago-prueba-marca">{t.marca}</span>
              <span className="checkout-pago-prueba-numero">
                •••• {t.numero.slice(-4)}
              </span>
              <span className="checkout-pago-prueba-titular">{t.titular}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Indicador de marca detectada ────────────────────────────────── */}
      {marca && (
        <div className="checkout-pago-marca" style={{ borderColor: marca.color }}>
          <span
            className="checkout-pago-marca-dot"
            style={{ background: marca.color }}
          />
          <span className="checkout-pago-marca-nombre">{marca.nombre}</span>
        </div>
      )}

      {/* ── Número de tarjeta ──────────────────────────────────────────── */}
      <div className="checkout-pago-campo">
        <label htmlFor="pago-numero">Número de tarjeta</label>
        <input
          id="pago-numero"
          type="text"
          value={form.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          onBlur={() => handleBlur('numero')}
          placeholder="1234 5678 9012 3456"
          autoComplete="cc-number"
          inputMode="numeric"
          maxLength={marca?.nombre === 'Amex' ? 17 : 19}
        />
        {mostrarError('numero') && (
          <span className="checkout-pago-error">{mostrarError('numero')}</span>
        )}
      </div>

      {/* ── Titular ────────────────────────────────────────────────────── */}
      <div className="checkout-pago-campo">
        <label htmlFor="pago-titular">Titular de la tarjeta</label>
        <input
          id="pago-titular"
          type="text"
          value={form.titular}
          onChange={(e) => handleChange('titular', e.target.value)}
          onBlur={() => handleBlur('titular')}
          placeholder="NOMBRE COMO FIGURA EN LA TARJETA"
          autoComplete="cc-name"
        />
        {mostrarError('titular') && (
          <span className="checkout-pago-error">{mostrarError('titular')}</span>
        )}
      </div>

      {/* ── Vencimiento + CVV ──────────────────────────────────────────── */}
      <div className="checkout-pago-fila">
        <div className="checkout-pago-campo">
          <label htmlFor="pago-vencimiento">Vencimiento</label>
          <input
            id="pago-vencimiento"
            type="text"
            value={form.vencimiento}
            onChange={(e) => handleChange('vencimiento', e.target.value)}
            onBlur={() => handleBlur('vencimiento')}
            placeholder="MM/AA"
            autoComplete="cc-exp"
            inputMode="numeric"
            maxLength={5}
          />
          {mostrarError('vencimiento') && (
            <span className="checkout-pago-error">{mostrarError('vencimiento')}</span>
          )}
        </div>

        <div className="checkout-pago-campo">
          <label htmlFor="pago-cvv">CVV</label>
          <input
            id="pago-cvv"
            type="text"
            value={form.cvv}
            onChange={(e) => handleChange('cvv', e.target.value)}
            onBlur={() => handleBlur('cvv')}
            placeholder={cvvMax === 4 ? '1234' : '123'}
            autoComplete="cc-csc"
            inputMode="numeric"
            maxLength={cvvMax}
          />
          {mostrarError('cvv') && (
            <span className="checkout-pago-error">{mostrarError('cvv')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPagoForm;