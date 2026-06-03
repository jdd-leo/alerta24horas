import { IsLatitude, IsLongitude, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSignalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  emoji!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description!: string;

  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @Type(() => Number)
  @IsLongitude()
  lng!: number;
}
