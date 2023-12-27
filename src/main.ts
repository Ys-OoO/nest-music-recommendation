import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { ResponseExceptionFilter } from './common/filters/exception/response-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //允许跨域
  app.use(cors());

  //中间件
  //守卫
  //拦截器
  //过滤器
  //全局异常过滤器，捕获异常并响应 code:0
  app.useGlobalFilters(new ResponseExceptionFilter());
  //管道
  //全局参数校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    }),
  );

  await app.listen(3000);
}
bootstrap();
