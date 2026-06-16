/**
 * DTO de respuesta para direcciones. Expone solo los campos relevantes
 * al cliente y oculta el ObjectId del usuario y banderas internas.
 */
export interface AddressResponseDto {
  id: string;
  calle: string;
  numero: string;
  piso?: string;
  departamento?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}

/**
 * DTO usado para crear una dirección (o dedupear contra una existente).
 * No incluye `usuario`: el servicio toma el id del usuario autenticado.
 */
export interface CrearAddressDto {
  calle: string;
  numero: string;
  piso?: string;
  departamento?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}
