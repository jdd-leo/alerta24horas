import { ConflictException, Injectable } from '@nestjs/common';
import { Flood } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Bbox, bboxWhere } from '../common/bbox.util';
import { CreateFloodDto } from './dto/create-flood.dto';

const MAX_ACTIVE_PER_USER = 10;
const TTL_HOURS = 72;

export interface FloodsResult {
  items: Pick<Flood, 'id' | 'level' | 'lat' | 'lng' | 'createdAt'>[];
  lastUpdatedAt: Date | null;
}

@Injectable()
export class FloodsService {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere() {
    return { deletedAt: null, expiresAt: { gt: new Date() } };
  }

  async list(bbox: Bbox | null): Promise<FloodsResult> {
    const where = { ...this.activeWhere(), ...bboxWhere(bbox) };

    const items = await this.prisma.flood.findMany({
      where,
      select: { id: true, level: true, lat: true, lng: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const lastUpdatedAt = items.length > 0 ? items[0].createdAt : null;
    return { items, lastUpdatedAt };
  }

  async create(userId: string, dto: CreateFloodDto): Promise<Flood> {
    const activeCount = await this.prisma.flood.count({
      where: { userId, ...this.activeWhere() },
    });
    if (activeCount >= MAX_ACTIVE_PER_USER) {
      throw new ConflictException(
        `Limite de ${MAX_ACTIVE_PER_USER} alagamentos ativos atingido`,
      );
    }

    const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);
    return this.prisma.flood.create({
      data: {
        userId,
        level: dto.level,
        lat: dto.lat,
        lng: dto.lng,
        expiresAt,
      },
    });
  }
}
