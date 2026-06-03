import { IsEnum, IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';
import { FloodLevel } from '@prisma/client';

export class CreateFloodDto {
  @IsEnum(FloodLevel)
  level!: FloodLevel;

  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @Type(() => Number)
  @IsLongitude()
  lng!: number;
}
