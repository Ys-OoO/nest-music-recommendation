import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from './entities/user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    //匹配用户名密码
    const curUser = await this.findUser(username);

    if (password !== curUser.password) {
      throw new HttpException('Password Error', HttpStatus.UNAUTHORIZED);
    }
    //生成token
    const token = this.jwtService.sign({ username: curUser.username });
    return token;
  }

  async register(userDto: CreateUserDto) {
    //查询是否用户已经存在
    const hasUser = await this.userRepo.find({
      where: { username: userDto.username },
    });
    if (hasUser.length) {
      return '用户已存在';
    }
    const user = new User();
    user.uid = uuid();
    user.username = userDto.username;
    user.password = userDto.password;
    user.role = UserRole.VISITOR;
    const res = await this.userRepo.save(user);
    if (res) {
      return '注册成功';
    } else {
      return '注册失败';
    }
  }

  async findUser(username: string): Promise<User> {
    //匹配用户名密码
    return await this.userRepo.findOne({ where: { username } });
  }
}
