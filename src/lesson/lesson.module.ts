import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Course } from 'src/course/entities/course.entity';
import { Modules } from 'src/module/entities/module.entity';
import { LessonService } from './lesson.service';
import { Assignment } from 'src/assignment/entities/assignment.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Lesson, Assignment,Enrollment]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '23h' },
    }),
  ],
  controllers: [LessonController],
  providers:  [LessonService],
})
export class LessonModule { }
