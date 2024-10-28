import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException, // Import for generic errors
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { User_Role } from 'src/enums/user.role.enum';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) { }

  async createLesson(createLessonData: CreateLessonDto, user: any) {
    try {
      if (user.role !== User_Role.Teacher) {
        throw new ForbiddenException('Only teachers can create lessons');
      }
      const lesson = this.lessonRepository.create(createLessonData);
      return await this.lessonRepository.save(lesson);
    } catch (error) {
      throw new InternalServerErrorException('Error creating lesson', error.message);
    }
  }

  async findAll(userId: number, courseId: number) {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { student: { id: userId }, course: { id: courseId } },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }

      return await this.lessonRepository.find({
        where: { module: { course: { id: courseId } } },
        relations: ['module'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching lessons', error.message);
    }
  }

  async findOne(id: number, userId: number, courseId: number) {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { student: { id: userId }, course: { id: courseId } },
      });

      if (!enrollment) {
        throw new ForbiddenException('You are not enrolled in this course');
      }

      const lesson = await this.lessonRepository.findOne({
        where: { id },
        relations: ['module'],
      });
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }

      return lesson;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching lesson', error.message);
    }
  }

  async update(id: number, updateLessonDto: UpdateLessonDto, user: any) {
    try {
      if (user.role !== User_Role.Teacher) {
        throw new ForbiddenException('Only teachers can update lessons');
      }

      const lesson = await this.lessonRepository.preload({ id, ...updateLessonDto });
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }

      return await this.lessonRepository.save(lesson);
    } catch (error) {
      throw new InternalServerErrorException('Error updating lesson', error.message);
    }
  }

  async remove(id: number, user: any) {
    try {
      if (user.role !== User_Role.Teacher) {
        throw new ForbiddenException('Only teachers can delete lessons');
      }

      const lesson = await this.lessonRepository.findOne({ where: { id } });
      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }

      return await this.lessonRepository.remove(lesson);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting lesson', error.message);
    }
  }
}
