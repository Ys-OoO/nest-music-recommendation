import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const multerConfig = {
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
  fileFilter: (_req: Request, file, cb) => {
    //文件过滤
    const allowedMimeTypes = ['audio', 'video', 'image/jpeg', 'image/png'];
    if (allowedMimeTypes.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new HttpException('Invalid file type', HttpStatus.BAD_REQUEST), false);
    }
  },
  storage: diskStorage({
    destination: join(__dirname, '../uploadedFiles/music'),
    filename: (_req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      const suffix = extname(file.originalname);
      return cb(null, `${randomName}${suffix}`);
    },
  }),
};
