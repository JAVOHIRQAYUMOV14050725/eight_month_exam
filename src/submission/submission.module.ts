import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { JwtModule } from '@nestjs/jwt';
import { Assignment } from '../assignment/entities/assignment.entity';
import { SubmissionController } from './submission.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, Assignment]),
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1d' },
  }),
    CacheModule.register(),
        UserModule
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule { }
