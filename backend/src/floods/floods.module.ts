import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FloodsController } from './floods.controller';
import { FloodsService } from './floods.service';

@Module({
  imports: [AuthModule],
  controllers: [FloodsController],
  providers: [FloodsService],
})
export class FloodsModule {}
