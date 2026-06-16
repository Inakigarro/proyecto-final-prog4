import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Carpeta absoluta donde se guardan las imágenes del slider.
 * Vive en server/public/uploads/slides; Express la sirve estáticamente
 * desde /uploads/slides en app.ts.
 */
const DESTINO_SLIDES = path.resolve(__dirname, '..', '..', 'public', 'uploads', 'slides');

// Crea la carpeta si no existe (importante para entornos limpios).
if (!fs.existsSync(DESTINO_SLIDES)) {
  fs.mkdirSync(DESTINO_SLIDES, { recursive: true });
}

/**
 * Genera un nombre de archivo único: timestamp + random alfanumérico.
 * Conserva la extensión original para que el browser pueda servirlo bien.
 */
function generarNombreArchivo(original: string): string {
  const ext = path.extname(original).toLowerCase() || '.jpg';
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${random}${ext}`;
}

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
 * Multer configurado para guardar imágenes de slides en disco local.
 * Tamaño máximo: 5MB por archivo.
 */
export const uploadSlideImagen = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, DESTINO_SLIDES),
    filename: (_req, file, cb) => cb(null, generarNombreArchivo(file.originalname)),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtroImagen,
});
