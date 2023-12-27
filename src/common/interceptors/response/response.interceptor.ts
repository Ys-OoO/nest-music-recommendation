import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { RETURN_ORIGINAL_KEY } from 'src/common/decorator/original/original.decorator';
import { ResponseEntity } from './responseEntity';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        //@original注解标识的方法不需要wrap
        const original = this.reflector.get<boolean>(
          RETURN_ORIGINAL_KEY,
          context.getHandler(),
        );
        if (original) {
          return data;
        }
        const response = context.switchToHttp().getResponse<Response>();
        response.setHeader('Content-Type', 'application/json;charset=utf-8');
        return new ResponseEntity({
          data,
          code: 200,
          status: 0,
          msg: 'success',
        });
      }),
    );
  }
}
