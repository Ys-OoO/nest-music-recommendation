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
import { jwtConstant } from 'src/common/constant/jwtConstant';
import { NEED_AUTH_KEY } from 'src/common/decorator/need-auth/need-auth.decorator';
import { IS_PRIVATE_KEY } from 'src/common/decorator/private/private.decorator';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public/public.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //获取isPublic注解
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<Request>();

    const isPrivate = this.reflector.getAllAndOverride<boolean>(
      IS_PRIVATE_KEY,
      [context.getHandler()],
    );

    if (isPublic && !isPrivate) {
      return true;
    }
    //判断token是否存在
    const token = request.headers['musictoken'] as string;
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
    if (isEmpty(request[jwtConstant.CUR_USERNAME])) {
      throw new HttpException('用户失效，请联系管理员', HttpStatus.FORBIDDEN);
    }

    //权限校验
    const needAuth = this.reflector.get(NEED_AUTH_KEY, context.getHandler());
    if (!needAuth || needAuth === UserRole.VISITOR) {
      return true;
    }
    //权限获取及验证
    const curUser = await this.userService.findUser(
      request[jwtConstant.CUR_USERNAME],
    );

    if (curUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        '无权限，请联系管理员申请权限',
        HttpStatus.FORBIDDEN,
      );
    }
    //放行
    return true;
  }
}
