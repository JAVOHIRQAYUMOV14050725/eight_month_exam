import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { Assignment } from './entities/assignment.entity';
import { Modules } from '../module/entities/module.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Modules, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule { }
