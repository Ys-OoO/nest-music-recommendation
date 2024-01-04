import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import * as fs from 'fs-extra';
import { forEach, isEmpty, map } from 'lodash';
import { extname, join } from 'path';
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
      try {
        await this.musicRepo.save(music);
        return '上传成功';
      } catch (error) {
        await this.deleteFiles(
          map(files, (item) => {
            return item[0].path;
          }),
        );
        throw new HttpException('上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
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

  async saveFile(musicFileDto: CreateMusicDto, musicPath) {
    const music = new Music();
    music.name = musicFileDto.name;
    music.singer = musicFileDto.singer;
    music.music = musicPath;
    music.cover = 'test cover url';
    await this.musicRepo.save(music);
    return '上传成功';
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

  async getMusic(response: Response, mid: number) {
    const music = await this.musicRepo.findOne({
      where: { mid },
    });

    if (isEmpty(music)) {
      throw new HttpException('404 NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      const musicFileStream = fs.createReadStream(join(music.music));
      // response.setHeader('Content-Type', 'application/octet-stream');
      const type = extname(music.music);

      response.setHeader('Content-Type', `video/${type.slice(1)}`);

      musicFileStream.on('end', () => {
        response.end();
      });

      // 处理流错误事件，如果出现错误，将其发送到响应并结束
      musicFileStream.on('error', (error) => {
        console.error('Error reading file stream:', error);
        response.status(500).send(error.message);
      });

      musicFileStream.pipe(response);
    }
  }

  async getCover(response: Response, mid: number) {
    const music = await this.musicRepo.findOne({
      where: { mid },
    });

    if (isEmpty(music)) {
      throw new HttpException('404 NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      const musicFileStream = fs.createReadStream(join(music.cover));
      // response.setHeader('Content-Type', 'application/octet-stream');
      const { cover } = music;
      const type = extname(cover);

      response.setHeader('Content-Type', `image/${type.slice(1)}`);

      musicFileStream.on('end', () => {
        response.end();
      });

      // 处理流错误事件，如果出现错误，将其发送到响应并结束
      musicFileStream.on('error', (error) => {
        console.error('Error reading file stream:', error);
        response.status(500).send(error.message);
      });
      musicFileStream.pipe(response);
    }
  }

  async findAll() {
    const [allMusic, count] = await this.musicRepo.findAndCount();
    return {
      allMusic,
      count,
    };
  }

  uploadChunk(chunk: Express.Multer.File, chunkInfo: any) {
    const { fileHash, index } = chunkInfo;

    const dirPath = join(__dirname, '\\uploadedFiles\\chunkFile', fileHash);
    const chunkPath = join(dirPath, `chunk-${index}`);

    //检查文件夹是否存在
    const hasDir = fs.existsSync(dirPath);

    if (hasDir) {
      //检查分块是否存在
      const hasChunk = fs.existsSync(join(dirPath, `chunk-${index}`));

      if (hasChunk) return;
      //添加分块
      fs.writeFile(chunkPath, chunk.buffer, (error) => {
        if (error) {
          console.error(error);
        }
      });
    } else {
      //创建文件夹,并添加当前分片  文件名为fileHash
      new Promise((resolve, reject) => {
        fs.mkdir(
          dirPath,
          {
            recursive: true,
          },
          (error) => {
            if (error) {
              reject(false);
            } else {
              resolve(true);
            }
          },
        );
      }).then((res) => {
        if (res) {
          // 添加当前分片

          fs.writeFile(chunkPath, chunk.buffer, (error) => {
            if (error) {
              console.error(error);
            }
          });
        }
      });
    }
  }

  async vertifyFile(fileHash: string, totalCount: number, extname: string) {
    const dirPath = join(__dirname, '\\uploadedFiles\\chunkFile', fileHash);
    const filePath = dirPath + extname;

    let res = Array(totalCount)
      .fill(0)
      .map((_, index) => index + 1);

    try {
      //读取文件状态
      fs.statSync(filePath);
      //读取成功，即秒传
      return { neededFileList: [], message: '上传成功' };
    } catch (fileError) {
      try {
        fs.statSync(dirPath);
        const files = await fs.readdir(dirPath);
        if (files.length < totalCount) {
          //计算待上传序列
          res = res.filter((fileIndex) => {
            return !files.includes(`chunk-${fileIndex}`);
          });
          return { neededFileList: res };
        } else {
          //未进行合并,去合并
          await this.mergeFile(fileHash, '.mp4');
          return { neededFileList: [], message: '上传成功' };
        }
      } catch (dirError) {
        //读取文件夹失败，返回全序列
        return { neededFileList: res };
      }
    }
  }

  async mergeFile(fileHash: string, extname: string) {
    const dirPath = join(__dirname, '\\uploadedFiles\\chunkFile', fileHash);
    const fullPath = join(
      __dirname,
      '\\uploadedFiles\\chunkFile',
      fileHash + extname,
    );

    try {
      // 检查文件是否已存在
      await fs.promises.access(fullPath);
      return '文件已存在';
    } catch (error) {
      // 文件不存在，继续执行
    }

    // 创建写入流
    const writeStream = fs.createWriteStream(fullPath);

    // 读取文件夹，将文件夹中的所有分块进行合并
    try {
      const files = await fs.promises.readdir(dirPath);

      // 对文件进行排序
      files.sort((a, b) => {
        const indexA = parseInt(a.split('-').pop());
        const indexB = parseInt(b.split('-').pop());
        return indexA - indexB;
      });

      // 按顺序写入/合并
      for (let index = 0; index < files.length; index++) {
        const filename = files[index];
        const curFilePath = join(dirPath, filename);
        const readStream = fs.createReadStream(curFilePath);

        // 判断是否是最后一块
        const isLastChunk = index === files.length - 1;

        // 使用 await 确保异步操作完成
        await new Promise((resolve, reject) => {
          readStream.pipe(writeStream, { end: isLastChunk });
          readStream.on('end', resolve);
          readStream.on('error', reject);
        });
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }

    // 删除保存分块的文件夹
    try {
      await this.removeDir(dirPath);
    } catch (error) {
      console.error('Error removing directory:', error);
    }

    console.log('Files merged successfully');
    const musicFileDto = new CreateMusicDto();
    musicFileDto.name = 'ys upload';
    musicFileDto.singer = 'unknow';
    this.saveFile(musicFileDto, fullPath);
    return '合并完成';
  }

  async removeDir(dirPath) {
    try {
      const files = await fs.promises.readdir(dirPath);
      await Promise.all(
        files.map((file) => fs.promises.unlink(join(dirPath, file))),
      );
      await fs.promises.rmdir(dirPath);
      console.log('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }
}
