import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Modules } from '../module/entities/module.entity';
import { LessonService } from './lesson.service';
import { Assignment } from '../assignment/entities/assignment.entity';
import { UserModule } from 'src/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Course } from '../course/entities/course.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Lesson, Assignment, Enrollment, Modules, Course]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '23h' },
    }),
    CacheModule.register(),
    UserModule
  ],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule { }
