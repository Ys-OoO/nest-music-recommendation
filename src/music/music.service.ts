import {
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import * as fs from 'fs';
import { forEach, isEmpty, map } from 'lodash';
import { join } from 'path';
import { Repository } from 'typeorm';
import { CreateMusicDto } from './dto/create-music.dto';
import { Music } from './entities/music.entity';
@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music) private readonly musicRepo: Repository<Music>,
  ) {}

  async upload(
    musicFileDto: CreateMusicDto,
    files: {
      cover: Express.Multer.File;
      music: Express.Multer.File;
    },
  ) {
    if (files && files?.cover && files?.music) {
      const music = new Music();
      music.name = musicFileDto.name;
      music.singer = musicFileDto.singer;
      music.cover = files.cover[0].path;
      music.music = files.music[0].path;
      const insertMusic = await this.musicRepo.save(music);
      if (isEmpty(insertMusic)) {
        await this.deleteFiles(
          map(files, (item) => {
            return item[0].path;
          }),
        );
      } else {
        return '上传成功';
      }
    } else {
      //删除已上传文件
      await this.deleteFiles(
        map(files, (item) => {
          return item[0].path;
        }),
      );
      throw new HttpException(
        'network Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFiles(filePaths: string[]) {
    return new Promise((resolve, reject) => {
      forEach(filePaths, (filePath) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(false);
          }
        });
      });
    });
  }

  async download(response: Response, mid: number) {
    const music = await this.musicRepo.findOne({
      where: { mid },
    });
    if (isEmpty(music)) {
      throw new HttpException('404 NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      return response.download(music.music, music.name, (err) => {
        if (!err) {
          return;
        }

        throw new HttpException(
          'download failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    }
  }

  async getOne(response: Response, mid: number) {
    const music = await this.musicRepo.findOne({
      where: { mid },
    });
    if (isEmpty(music)) {
      throw new HttpException('404 NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      return response.sendFile(music.music, (err) => {
        if (!err) {
          return;
        }

        throw new HttpException(
          'download failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    }
  }

  async view(response: Response, mid: number) {
    const music = await this.musicRepo.findOne({
      where: { mid },
    });
    if (isEmpty(music)) {
      throw new HttpException('404 NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      const musicFile = fs.createReadStream(join(music.music));
      return new StreamableFile(musicFile);
    }
  }

  async findAll() {
    const [allMusic, count] = await this.musicRepo.findAndCount();
    return {
      allMusic,
      count,
    };
  }
}
