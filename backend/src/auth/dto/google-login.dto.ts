import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  idToken!: string;
}

export class DevLoginDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}
