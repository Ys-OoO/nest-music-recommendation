import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NeedAuth } from 'src/common/decorator/need-auth/need-auth.decorator';
import { Original } from 'src/common/decorator/original/original.decorator';
import { Public } from 'src/common/decorator/public/public.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { CreateMusicDto } from './dto/create-music.dto';
import { multerConfig } from './multerConfig/multerConfig';
import { MusicService } from './music.service';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post('/uploadDirect')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'music', maxCount: 2 },
        { name: 'cover', maxCount: 2 },
      ],
      multerConfig,
    ),
  )
  @NeedAuth(UserRole.ADMIN)
  uploadMusic(
    @Body() createMusicDto: CreateMusicDto,
    @UploadedFiles()
    files: {
      cover: Express.Multer.File;
      music: Express.Multer.File;
    },
  ) {
    return this.musicService.upload(createMusicDto, files);
  }

  @Post('/donwloadDirect')
  downloadMusic(@Res() response, @Body('mid') mid: number) {
    return this.musicService.download(response, mid);
  }

  @Post('getOne')
  public getOne(@Res() response, @Body('mid') mid: number) {
    return this.musicService.getOne(response, mid);
  }

  @Get('view/:mid')
  @Public()
  @Original()
  public getCover(@Res() response, @Param('mid') mid: any) {
    return this.musicService.getCover(response, mid);
  }

  @Get('/all')
  findAll() {
    return this.musicService.findAll();
  }
}
