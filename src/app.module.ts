import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { ModuleModule } from './module/module.module';
import { LessonModule } from './lesson/lesson.module';
import { AssignmentModule } from './assignment/assignment.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { SubmissionModule } from './submission/submission.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { Modules } from './module/entities/module.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Course } from './course/entities/course.entity';
import { Enrollment } from './enrollment/entities/enrollment.entity';
import { Lesson } from './lesson/entities/lesson.entity';
import { Submission } from './submission/entities/submission.entity';
import { Assignment } from './assignment/entities/assignment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: +configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USER') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || '4545',
        database: configService.get<string>('DB_NAME') || 'online_course',
        autoLoadEntities: true,
        synchronize: true,
        entities: [
          User,
          Course,
          Enrollment,
          Lesson,
          Modules,
          Submission,
          Assignment
        ]
      }),
      
      inject: [ConfigService],
    }),    
    UserModule, CourseModule, ModuleModule, LessonModule, AssignmentModule, EnrollmentModule, SubmissionModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
