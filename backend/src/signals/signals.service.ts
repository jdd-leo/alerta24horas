import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Signal } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Bbox, bboxWhere } from '../common/bbox.util';
import { CreateSignalDto } from './dto/create-signal.dto';

const MAX_ACTIVE_PER_USER = 3;
const TTL_HOURS = 24;

@Injectable()
export class SignalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private activeWhere() {
    return { deletedAt: null, expiresAt: { gt: new Date() } };
  }

  private toPublicUrl(filename: string): string {
    const base = this.config.get<string>('publicBaseUrl');
    return `${base}/uploads/${filename}`;
  }

  private serialize(signal: Signal) {
    return {
      id: signal.id,
      emoji: signal.emoji,
      title: signal.title,
      description: signal.description,
      photos: signal.photos.map((f) => this.toPublicUrl(f)),
      lat: signal.lat,
      lng: signal.lng,
      createdAt: signal.createdAt,
      expiresAt: signal.expiresAt,
    };
  }

  async list(bbox: Bbox | null) {
    const signals = await this.prisma.signal.findMany({
      where: { ...this.activeWhere(), ...bboxWhere(bbox) },
      orderBy: { createdAt: 'desc' },
    });
    return signals.map((s) => this.serialize(s));
  }

  async findOne(id: string) {
    const signal = await this.prisma.signal.findFirst({
      where: { id, ...this.activeWhere() },
    });
    if (!signal) throw new NotFoundException('Sinalização não encontrada');
    return this.serialize(signal);
  }

  async listMine(userId: string) {
    const signals = await this.prisma.signal.findMany({
      where: { userId, ...this.activeWhere() },
      orderBy: { createdAt: 'desc' },
    });
    return signals.map((s) => this.serialize(s));
  }

  async create(userId: string, dto: CreateSignalDto, photos: string[]) {
    const activeCount = await this.prisma.signal.count({
      where: { userId, ...this.activeWhere() },
    });
    if (activeCount >= MAX_ACTIVE_PER_USER) {
      throw new ConflictException(
        `Limite de ${MAX_ACTIVE_PER_USER} sinalizações ativas atingido`,
      );
    }

    const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);
    const signal = await this.prisma.signal.create({
      data: {
        userId,
        emoji: dto.emoji,
        title: dto.title,
        description: dto.description,
        photos,
        lat: dto.lat,
        lng: dto.lng,
        expiresAt,
      },
    });
    return this.serialize(signal);
  }

  /** Soft-delete: marca deletedAt, sem apagar registro nem fotos. */
  async softDelete(userId: string, id: string): Promise<void> {
    const signal = await this.prisma.signal.findUnique({ where: { id } });
    if (!signal || signal.deletedAt) {
      throw new NotFoundException('Sinalização não encontrada');
    }
    if (signal.userId !== userId) {
      throw new ForbiddenException('Você só pode excluir suas sinalizações');
    }
    await this.prisma.signal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
