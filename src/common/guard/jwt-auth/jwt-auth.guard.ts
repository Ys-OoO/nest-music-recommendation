import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { jwtConstant } from 'src/common/constant/jwtConstant';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //获取isPublic注解
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    //判断token是否存在
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['token'] as string;
    if (isEmpty(token)) {
      throw new HttpException('Without Auth', HttpStatus.FORBIDDEN);
    }
    //验证token
    try {
      const res = this.jwtService.verify(token, { secret: jwtConstant.SERECT });
      //解析成功，将用户信息挂载到请求上,也可以调数据库挂载User实例
      request[jwtConstant.CUR_USERNAME] = res.username;
    } catch (error) {
      throw new HttpException(error, HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
