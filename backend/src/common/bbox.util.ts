import { BadRequestException } from '@nestjs/common';

export interface Bbox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

/**
 * Parseia o parâmetro `bbox=minLng,minLat,maxLng,maxLat`.
 * Retorna null quando ausente (a chamada lista tudo dentro do limite padrão).
 */
export function parseBbox(raw?: string): Bbox | null {
  if (!raw) return null;

  const parts = raw.split(',').map((p) => Number(p.trim()));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    throw new BadRequestException(
      'bbox inválido. Formato esperado: minLng,minLat,maxLng,maxLat',
    );
  }

  const [minLng, minLat, maxLng, maxLat] = parts;
  if (minLng > maxLng || minLat > maxLat) {
    throw new BadRequestException('bbox inválido: limites invertidos');
  }

  return { minLng, minLat, maxLng, maxLat };
}

/** Cláusula Prisma de lat/lng dentro do bbox (vazio quando não há bbox). */
export function bboxWhere(bbox: Bbox | null) {
  if (!bbox) return {};
  return {
    lat: { gte: bbox.minLat, lte: bbox.maxLat },
    lng: { gte: bbox.minLng, lte: bbox.maxLng },
  };
}
