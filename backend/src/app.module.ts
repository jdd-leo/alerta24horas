import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadConfig } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FloodsModule } from './floods/floods.module';
import { SignalsModule } from './signals/signals.module';
import { EmergencyModule } from './emergency/emergency.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfig],
    }),
    PrismaModule,
    AuthModule,
    FloodsModule,
    SignalsModule,
    EmergencyModule,
  ],
})
export class AppModule {}
