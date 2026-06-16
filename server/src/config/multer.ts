import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

/**
 * Configuración de Multer para subida de imágenes del slider.
 *
 * Decisión: storage en memoria (no en disco). Las imágenes se persisten como
 * `data:image/...;base64,...` directamente en el documento de Slide en Mongo.
 * Ventaja: el slider es portable (las imágenes viajan con la BD, no dependen
 * del filesystem del server). Apto para volúmenes chicos (un slider típico
 * tiene 3-10 slides), no para galerías masivas.
 *
 * Límite: 1MB por archivo. MongoDB tiene un tope de 16MB por documento; con
 * el overhead del base64 (~33% más que el binario) un archivo de 1MB queda
 * en ~1.4MB, holgado para el límite.
 */

/**
 * Acepta solo archivos de imagen comunes para evitar que se suban otros
 * tipos por error o malicia.
 */
function filtroImagen(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Solo se permiten archivos de imagen'));
}

/**
 * Multer en modo memoria. El controller toma `req.file.buffer` y lo convierte
 * a un data URI base64 antes de persistirlo.
 */
export const uploadSlideImagen = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: filtroImagen,
});
