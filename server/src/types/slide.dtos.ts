/**
 * DTOs del módulo de slides del home.
 * El campo `imagen` siempre se envía y recibe como URL absoluta del backend.
 */

export interface SlideResponse {
  id: string;
  imagen: string;
  alt: string;
  leyenda: string;
  orden: number;
}

export interface CrearSlideDto {
  imagen: string;
  alt: string;
  leyenda: string;
  orden: number;
}

/** Todos los campos opcionales para soportar update parcial. */
export type ActualizarSlideDto = Partial<CrearSlideDto>;

/**
 * Respuesta del endpoint de upload de imagen.
 * El cliente usa la `url` devuelta para popular el campo imagen al crear el slide.
 */
export interface SlideUploadResponse {
  url: string;
}
