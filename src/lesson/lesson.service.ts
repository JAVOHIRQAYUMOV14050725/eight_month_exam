import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) { }

  async create(createLessonData: CreateLessonDto): Promise<{ statusCode: number, message: string, data?: Lesson }> {
    try {
      const lesson = this.lessonRepository.create(createLessonData);
      const savedLesson = await this.lessonRepository.save(lesson);
      return { statusCode: 201, message: 'Lesson created successfully', data: savedLesson };
    } catch (error) {
      console.error('Error creating lesson:', error);
      return { statusCode: 500, message: `Error creating lesson: ${error.message}` };
    }
  }

  async findAll(userId: number, courseId: number): Promise<{ statusCode: number, message: string, data?: Lesson[] }> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({ where: { student: { id: userId }, course: { id: courseId } } });
      if (!enrollment) {
        return { statusCode: 403, message: 'You are not enrolled in this course' };
      }
      const lessons = await this.lessonRepository.find({ where: { module: { course: { id: courseId } } }, relations: ['module'] });
      return { statusCode: 200, message: 'Lessons fetched successfully', data: lessons };
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return { statusCode: 500, message: `Error fetching lessons: ${error.message}` };
    }
  }

  async findOne(id: number, userId: number, courseId: number): Promise<{ statusCode: number, message: string, data?: Lesson }> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({ where: { student: { id: userId }, course: { id: courseId } } });
      if (!enrollment) {
        return { statusCode: 403, message: 'You are not enrolled in this course' };
      }
      const lesson = await this.lessonRepository.findOne({ where: { id }, relations: ['module'] });
      if (!lesson) {
        return { statusCode: 404, message: `Lesson with ID ${id} not found` };
      }
      return { statusCode: 200, message: 'Lesson fetched successfully', data: lesson };
    } catch (error) {
      console.error('Error fetching lesson:', error);
      return { statusCode: 500, message: `Error fetching lesson: ${error.message}` };
    }
  }

  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<{ statusCode: number, message: string, data?: Lesson }> {
    try {
      const lesson = await this.lessonRepository.preload({ id, ...updateLessonDto });
      if (!lesson) {
        return { statusCode: 404, message: `Lesson with ID ${id} not found` };
      }
      const updatedLesson = await this.lessonRepository.save(lesson);
      return { statusCode: 200, message: 'Lesson updated successfully', data: updatedLesson };
    } catch (error) {
      console.error('Error updating lesson:', error);
      return { statusCode: 500, message: `Error updating lesson: ${error.message}` };
    }
  }

  async remove(id: number): Promise<{ statusCode: number, message: string }> {
    try {
      const lesson = await this.lessonRepository.findOne({ where: { id } });
      if (!lesson) {
        return { statusCode: 404, message: `Lesson with ID ${id} not found` };
      }
      await this.lessonRepository.remove(lesson);
      return { statusCode: 200, message: 'Lesson deleted successfully' };
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { statusCode: 500, message: `Error deleting lesson: ${error.message}` };
    }
  }
}
