import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Course } from '../course/entities/course.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from '../user/user.module';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Modules, Course,Enrollment]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.register(),
    UserModule
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleModule { }
