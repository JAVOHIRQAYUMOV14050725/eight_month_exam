import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          cb(null, file.filename + '-' + uniqueSuffix + extname(file.originalname)); 
        },

      }),
    }),],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
