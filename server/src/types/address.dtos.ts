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
