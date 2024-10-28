import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Enrollment, Course, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
})
export class EnrollmentModule { }
