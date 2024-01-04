import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
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
    console.log(files);

    return this.musicService.upload(createMusicDto, files);
  }

  @Post('/uploadChunk')
  @UseInterceptors(
    FileInterceptor('chunk', {
      limits: {
        fileSize: 1024 * 1024 * 10,
      },
    }),
  )
  @NeedAuth(UserRole.ADMIN)
  uploadChunk(
    @UploadedFile()
    chunk: Express.Multer.File,
    @Body() chunkInfo: any,
  ) {
    return this.musicService.uploadChunk(chunk, chunkInfo);
  }

  @Post('/vertifyFile')
  @NeedAuth(UserRole.ADMIN)
  vertifyFile(@Body() fileInfo) {
    const { fileHash, totalCount, extname } = fileInfo;
    return this.musicService.vertifyFile(fileHash, totalCount, extname);
  }

  @Post('/mergeFile')
  @NeedAuth(UserRole.ADMIN)
  mergeFile(@Body() fileInfo) {
    const { fileHash, extname } = fileInfo;
    return this.musicService.mergeFile(fileHash, extname);
  }

  @Post('/donwloadDirect')
  downloadMusic(@Res() response, @Body('mid') mid: number) {
    return this.musicService.download(response, mid);
  }

  @Get('/getMusic/:mid')
  @Public()
  @Original()
  public getMusic(@Res() response, @Param('mid') mid: number) {
    return this.musicService.getMusic(response, mid);
  }

  @Get('view/:mid')
  @Public()
  @Original()
  public getCover(@Res() response, @Param('mid') mid: any) {
    return this.musicService.getCover(response, mid);
  }

  @Public()
  @Get('/all')
  findAll() {
    return this.musicService.findAll();
  }
}
