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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Lesson, Assignment,Enrollment,Modules]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '23h' },
    }),
  ],
  controllers: [LessonController],
  providers:  [LessonService],
})
export class LessonModule { }
