import { Controller } from '@nestjs/common';
import { MusicService } from './music.service';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  // @Post('/upload')
  // uploadMusic(createMusicDto: CreateMusicDto) {
  //   this.musicService.upload();
  // }
}
