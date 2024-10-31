import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Modules } from '../module/entities/module.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { UserModule } from '../user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Course,Modules,Lesson,Enrollment]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.register(),
    UserModule  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule { }
