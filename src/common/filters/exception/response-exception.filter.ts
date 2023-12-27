import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseEntity } from 'src/common/interceptors/response/responseEntity';

@Catch()
export class ResponseExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    // HttpException 异常
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : `${exception}`;

    //code 指定为0，可根据业务需求调整
    const result = new ResponseEntity({
      code: 0,
      data: null,
      msg: message,
      status,
    });
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.status(200).send(result);
  }
}
