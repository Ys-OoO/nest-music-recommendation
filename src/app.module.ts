import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guard/jwt-auth/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response/response.interceptor';
import { MusicModule } from './music/music.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      username: 'root',
      password: '123456',
      host: 'localhost',
      port: 3306,
      database: 'music',
      synchronize: true, //是否自动将实体类同步到数据库
      retryDelay: 500, //重试连接数据库间隔 ms
      retryAttempts: 3, //重试连接数据库次数
      autoLoadEntities: true, //可以替代entities配置，可自动加载实体、关联表
    }),
    TypeOrmModule.forFeature([User]),
    UserModule,
    MusicModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    UserService,
    //注入全局的Jwt守卫，由于守卫需要reflector，jwtService依赖，因此只能通过module注入
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    //注入全局的响应拦截器，由于需要reflector，因此只能通过module注入
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
