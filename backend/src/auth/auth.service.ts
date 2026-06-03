import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;
  private readonly devAuth: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClientId = this.config.get<string>('googleClientId') ?? '';
    this.devAuth = this.config.get<boolean>('devAuth') ?? false;
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  async loginWithGoogle(idToken: string): Promise<{ token: string; user: User }> {
    if (!this.googleClientId) {
      throw new InternalServerErrorException(
        'GOOGLE_CLIENT_ID não configurado no backend',
      );
    }

    let profile: GoogleProfile;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new Error('payload incompleto');
      }
      profile = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        picture: payload.picture,
      };
    } catch {
      throw new UnauthorizedException('idToken do Google inválido');
    }

    return this.upsertAndSign(profile);
  }

  /** Login de desenvolvimento sem Google. Só funciona com DEV_AUTH=true. */
  async devLogin(email: string, name?: string): Promise<{ token: string; user: User }> {
    if (!this.devAuth) {
      throw new UnauthorizedException('Login de desenvolvimento desabilitado');
    }
    return this.upsertAndSign({
      googleId: `dev:${email}`,
      email,
      name: name ?? email,
    });
  }

  private async upsertAndSign(
    profile: GoogleProfile,
  ): Promise<{ token: string; user: User }> {
    const user = await this.prisma.user.upsert({
      where: { googleId: profile.googleId },
      update: {
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      },
      create: {
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await this.jwt.signAsync(payload);
    return { token, user };
  }
}
