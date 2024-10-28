import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { JwtModule } from '@nestjs/jwt';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { SubmissionController } from './submission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Submission,Assignment]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    })
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}
