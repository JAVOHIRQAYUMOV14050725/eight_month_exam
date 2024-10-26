import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { content_type } from 'src/enums/lesson.contentType.enum';

@Injectable()
@Injectable()
export class LessonService {
  async createLesson(createLessonDto: CreateLessonDto, filePath: string | null) {
    const newLesson = new Lesson();
    newLesson.title = createLessonDto.title;
    newLesson.contentType = createLessonDto.contentType;
    newLesson.content = createLessonDto.content;
    newLesson.filePath = filePath;
    return newLesson; 
  }


  findAll() {
    return `This action returns all lesson`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lesson`;
  }

  update(id: number, updateLessonDto: UpdateLessonDto) {
    return `This action updates a #${id} lesson`;
  }

  remove(id: number) {
    return `This action removes a #${id} lesson`;
  }
}
