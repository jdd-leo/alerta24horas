import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FloodsService } from './floods.service';
import { CreateFloodDto } from './dto/create-flood.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { parseBbox } from '../common/bbox.util';

@Controller('floods')
export class FloodsController {
  constructor(private readonly floods: FloodsService) {}

  @Get()
  list(@Query('bbox') bbox?: string) {
    return this.floods.list(parseBbox(bbox));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateFloodDto) {
    return this.floods.create(user.sub, dto);
  }
}
