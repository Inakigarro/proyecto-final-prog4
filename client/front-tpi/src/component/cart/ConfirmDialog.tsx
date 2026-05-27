'use client';

/**
 * ConfirmDialog — modal de confirmación reusable dentro del módulo carrito.
 *
 * Reemplaza al window.confirm() nativo. Controlado por props: el padre maneja
 * el estado abierto/cerrado y las acciones de confirmar/cancelar.
 */

import { useEffect } from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Si es true, el botón de confirmar se ve en rojo (acción destructiva). */
  destructivo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ConfirmDialog = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  destructivo = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) => {
  // Cerrar con Escape + bloquear scroll del body mientras está abierto.
  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar();
    };
    document.addEventListener('keydown', onKeyDown);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = scrollPrevio;
    };
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <>
      <div
        className="confirm-dialog-overlay"
        onClick={onCancelar}
        aria-hidden="true"
      />

      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <h2 id="confirm-dialog-title" className="confirm-dialog-titulo">
          {titulo}
        </h2>
        <p id="confirm-dialog-desc" className="confirm-dialog-mensaje">
          {mensaje}
        </p>

        <div className="confirm-dialog-acciones">
          <button
            type="button"
            className="confirm-dialog-btn-cancelar"
            onClick={onCancelar}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={
              destructivo
                ? 'confirm-dialog-btn-confirmar confirm-dialog-btn-destructivo'
                : 'confirm-dialog-btn-confirmar'
            }
            onClick={onConfirmar}
            autoFocus
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;