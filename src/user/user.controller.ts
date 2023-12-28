import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NeedAuth } from 'src/common/decorator/need-auth/need-auth.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';

// @Public()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  login(@Body() logInfo) {
    if (!logInfo?.username || !logInfo?.password) {
      throw new HttpException('请填写账号密码', HttpStatus.BAD_REQUEST);
    }
    return this.userService.login(logInfo.username, logInfo.password);
  }

  @Post('/register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Get('/test')
  @NeedAuth(UserRole.ADMIN)
  // @Original()
  test() {
    return 'test';
  }
}
