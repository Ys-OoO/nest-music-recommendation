import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstant } from 'src/common/constant/jwtConstant';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: jwtConstant.SERECT,
      signOptions: { expiresIn: jwtConstant.EXPIRESIN },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
