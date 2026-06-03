import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { MAX_PHOTOS, signalUploadOptions } from './upload.config';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { parseBbox } from '../common/bbox.util';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signals: SignalsService) {}

  @Get()
  list(@Query('bbox') bbox?: string) {
    return this.signals.list(parseBbox(bbox));
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: JwtPayload) {
    return this.signals.listMine(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signals.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('photos', MAX_PHOTOS, signalUploadOptions()))
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSignalDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const photos = files.map((f) => f.filename);
    return this.signals.create(user.sub, dto, photos);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.signals.softDelete(user.sub, id);
  }
}
