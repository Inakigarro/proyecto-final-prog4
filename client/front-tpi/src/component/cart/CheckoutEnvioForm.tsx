'use client';

/**
 * Formulario de datos de envío (paso 1 del checkout).
 *
 * Responsabilidades:
 * - Levantar las direcciones guardadas del usuario y permitir elegir una.
 * - O caer a un alta nueva con campos estructurados (calle, número, ciudad, etc.).
 * - Capturar nombre, apellido y teléfono del receptor del envío.
 * - Validar todo y notificar al padre cuando cambia el estado o la validez.
 */

import { useState, useEffect, useCallback } from 'react';
import type { DatosEnvioDto } from '@/lib/cart-types';
import { useDirecciones } from '@/app/perfil/_hooks/useDirecciones';
import SelectorDireccionGuardada, {
  VALOR_NUEVA_DIRECCION,
} from './_components/SelectorDireccionGuardada';
import FormularioDireccion, {
  type DatosDireccion,
  type ErroresDireccion,
} from './_components/FormularioDireccion';
import CamposContacto, {
  type DatosContacto,
  type ErroresContacto,
} from './_components/CamposContacto';
import { normalizarProvincia } from './_components/provincias-argentina';
import './CheckoutEnvioForm.css';

interface CheckoutEnvioFormProps {
  /** Valores iniciales para pre-cargar los datos de contacto (no de dirección). */
  valoresIniciales?: Partial<DatosContacto>;
  /** Se llama cada vez que cambian los datos o la validez del formulario. */
  onChange: (datos: DatosEnvioDto, esValido: boolean) => void;
  /** True cuando la sesión está hidratada — necesario para listar direcciones. */
  sesionLista: boolean;
}

/** Validador de un campo individual del subformulario de contacto. */
function validarContacto(campo: keyof DatosContacto, valor: string): string | undefined {
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
    case 'telefono':
      if (!v) return 'El teléfono es obligatorio';
      if (!/^\d+$/.test(v)) return 'Solo números';
      if (v.length !== 10) return 'Debe tener 10 dígitos (cód. área + número)';
      return undefined;
  }
}

/** Validador de un campo individual del subformulario de dirección. */
function validarDireccion(campo: keyof DatosDireccion, valor: string): string | undefined {
  const v = valor.trim();
  switch (campo) {
    case 'calle':
      if (!v) return 'La calle es obligatoria';
      if (v.length < 2) return 'Mínimo 2 caracteres';
      return undefined;
    case 'numero':
      if (!v) return 'El número es obligatorio';
      if (v.length > 10) return 'Máximo 10 caracteres';
      return undefined;
    case 'piso':
      if (v.length > 10) return 'Máximo 10 caracteres';
      return undefined;
    case 'departamento':
      if (v.length > 10) return 'Máximo 10 caracteres';
      return undefined;
    case 'ciudad':
      if (!v) return 'La ciudad es obligatoria';
      if (v.length < 2) return 'Mínimo 2 caracteres';
      return undefined;
    case 'provincia':
      if (!v) return 'La provincia es obligatoria';
      if (v.length < 2) return 'Mínimo 2 caracteres';
      return undefined;
    case 'codigoPostal':
      if (!v) return 'El código postal es obligatorio';
      if (v.length > 10) return 'Máximo 10 caracteres';
      return undefined;
  }
}

/** Estado vacío del subformulario de dirección. */
const DIRECCION_VACIA: DatosDireccion = {
  calle: '',
  numero: '',
  piso: '',
  departamento: '',
  ciudad: '',
  provincia: '',
  codigoPostal: '',
};

const CheckoutEnvioForm = ({
  valoresIniciales,
  onChange,
  sesionLista,
}: CheckoutEnvioFormProps) => {
  const { direcciones, cargando: cargandoDirecciones } = useDirecciones(sesionLista);

  const [contacto, setContacto] = useState<DatosContacto>({
    nombre: valoresIniciales?.nombre ?? '',
    apellido: valoresIniciales?.apellido ?? '',
    telefono: valoresIniciales?.telefono ?? '',
  });
  const [direccion, setDireccion] = useState<DatosDireccion>(DIRECCION_VACIA);

  /** Id de la dirección guardada elegida, o VALOR_NUEVA_DIRECCION para alta. */
  const [direccionId, setDireccionId] = useState<string>(VALOR_NUEVA_DIRECCION);

  /** Errores por campo. Solo se muestran si el campo fue tocado. */
  const [erroresContacto, setErroresContacto] = useState<ErroresContacto>({});
  const [erroresDireccion, setErroresDireccion] = useState<ErroresDireccion>({});

  /** Campos que ya fueron blureados, para gatear la muestra de errores. */
  const [tocadosContacto, setTocadosContacto] = useState<
    Partial<Record<keyof DatosContacto, boolean>>
  >({});
  const [tocadosDireccion, setTocadosDireccion] = useState<
    Partial<Record<keyof DatosDireccion, boolean>>
  >({});

  /**
   * Cuando el usuario eligió una dirección guardada, el formulario queda en
   * solo-lectura para evitar inconsistencias con la dirección persistida.
   * Para editar campos, debe pasar a "Nueva dirección".
   */
  const direccionGuardadaElegida = direccionId !== VALOR_NUEVA_DIRECCION;

  /**
   * Cuando llegan las direcciones del usuario por primera vez, autoseleccionamos
   * la más reciente. Si no tiene direcciones, queda en "Nueva dirección" y se
   * muestra el formulario para el alta.
   */
  useEffect(() => {
    if (cargandoDirecciones) return;
    if (direcciones.length === 0) return;
    if (direccionId !== VALOR_NUEVA_DIRECCION) return;

    const primera = direcciones[0]!;
    setDireccionId(primera.id);
    setDireccion({
      calle: primera.calle,
      numero: primera.numero,
      piso: primera.piso ?? '',
      departamento: primera.departamento ?? '',
      ciudad: primera.ciudad,
      provincia: normalizarProvincia(primera.provincia),
      codigoPostal: primera.codigoPostal,
    });
    // Solo cuando llegan las direcciones por primera vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargandoDirecciones, direcciones.length]);

  /**
   * Construye el DTO completo y la flag de validez a partir del estado actual,
   * y notifica al padre. La unidad de notificación es el resultado total, no
   * los cambios incrementales — el padre no necesita reconstruir nada.
   */
  const notificar = useCallback(
    (
      proximoContacto: DatosContacto,
      proximaDireccion: DatosDireccion,
      proximoId: string,
    ) => {
      const ec: ErroresContacto = {
        nombre: validarContacto('nombre', proximoContacto.nombre),
        apellido: validarContacto('apellido', proximoContacto.apellido),
        telefono: validarContacto('telefono', proximoContacto.telefono),
      };
      const ed: ErroresDireccion = {
        calle: validarDireccion('calle', proximaDireccion.calle),
        numero: validarDireccion('numero', proximaDireccion.numero),
        piso: validarDireccion('piso', proximaDireccion.piso),
        departamento: validarDireccion('departamento', proximaDireccion.departamento),
        ciudad: validarDireccion('ciudad', proximaDireccion.ciudad),
        provincia: validarDireccion('provincia', proximaDireccion.provincia),
        codigoPostal: validarDireccion('codigoPostal', proximaDireccion.codigoPostal),
      };
      setErroresContacto(ec);
      setErroresDireccion(ed);

      const esValido =
        Object.values(ec).every((e) => e === undefined) &&
        Object.values(ed).every((e) => e === undefined);

      const dto: DatosEnvioDto = {
        nombre: proximoContacto.nombre,
        apellido: proximoContacto.apellido,
        telefono: proximoContacto.telefono,
        calle: proximaDireccion.calle,
        numero: proximaDireccion.numero,
        piso: proximaDireccion.piso || undefined,
        departamento: proximaDireccion.departamento || undefined,
        ciudad: proximaDireccion.ciudad,
        provincia: proximaDireccion.provincia,
        codigoPostal: proximaDireccion.codigoPostal,
        direccionId: proximoId !== VALOR_NUEVA_DIRECCION ? proximoId : undefined,
      };

      onChange(dto, esValido);
    },
    [onChange],
  );

  /** Notificar al montar y cada vez que cambia el estado interno. */
  useEffect(() => {
    notificar(contacto, direccion, direccionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacto, direccion, direccionId]);

  const handleContactoChange = (campo: keyof DatosContacto, valor: string) => {
    const valorFinal = campo === 'telefono' ? valor.replace(/\D/g, '').slice(0, 10) : valor;
    setContacto((prev) => ({ ...prev, [campo]: valorFinal }));
  };

  const handleContactoBlur = (campo: keyof DatosContacto) => {
    setTocadosContacto((prev) => ({ ...prev, [campo]: true }));
  };

  const handleDireccionChange = (campo: keyof DatosDireccion, valor: string) => {
    setDireccion((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleDireccionBlur = (campo: keyof DatosDireccion) => {
    setTocadosDireccion((prev) => ({ ...prev, [campo]: true }));
  };

  /**
   * Cuando el usuario cambia la dirección guardada: autocompletamos los campos
   * con sus valores y marcamos todo como "no tocado" para no arrastrar errores
   * de la dirección anterior.
   */
  const handleCambioDireccionGuardada = (valor: string) => {
    setDireccionId(valor);
    setTocadosDireccion({});

    if (valor === VALOR_NUEVA_DIRECCION) {
      setDireccion(DIRECCION_VACIA);
      return;
    }

    const elegida = direcciones.find((d) => d.id === valor);
    if (!elegida) return;
    setDireccion({
      calle: elegida.calle,
      numero: elegida.numero,
      piso: elegida.piso ?? '',
      departamento: elegida.departamento ?? '',
      ciudad: elegida.ciudad,
      provincia: normalizarProvincia(elegida.provincia),
      codigoPostal: elegida.codigoPostal,
    });
  };

  return (
    <div className="checkout-envio">
      <h3 className="checkout-envio-titulo">Datos de envío</h3>
      <p className="checkout-envio-subtitulo">
        Completá tus datos para recibir el pedido.
      </p>

      <CamposContacto
        valores={contacto}
        errores={erroresContacto}
        tocados={tocadosContacto}
        onChange={handleContactoChange}
        onBlur={handleContactoBlur}
      />

      <SelectorDireccionGuardada
        direcciones={direcciones}
        valor={direccionId}
        onCambiar={handleCambioDireccionGuardada}
        cargando={cargandoDirecciones}
      />

      <FormularioDireccion
        valores={direccion}
        errores={erroresDireccion}
        tocados={tocadosDireccion}
        onChange={handleDireccionChange}
        onBlur={handleDireccionBlur}
        soloLectura={direccionGuardadaElegida}
      />
    </div>
  );
};

export default CheckoutEnvioForm;
