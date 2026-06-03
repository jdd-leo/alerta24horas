import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const MAX_PHOTOS = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = /^image\/(jpe?g|png|webp|gif)$/;

export function signalUploadOptions(): MulterOptions {
  return {
    storage: diskStorage({
      destination: process.env.UPLOAD_DIR ?? 'uploads',
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_PHOTOS },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED.test(file.mimetype)) {
        return cb(
          new BadRequestException('Apenas imagens (jpg, png, webp, gif)'),
          false,
        );
      }
      cb(null, true);
    },
  };
}
