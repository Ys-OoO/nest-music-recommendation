import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NeedAuth } from 'src/common/decorator/need-auth/need-auth.decorator';
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

  @Get('view')
  @Public()
  public view(@Res() response) {
    return this.musicService.view(response, 3);
  }

  @Get('/all')
  findAll() {
    return this.musicService.findAll();
  }
}
