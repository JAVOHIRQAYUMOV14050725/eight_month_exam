import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Modules } from 'src/module/entities/module.entity';
import { User_Role } from 'src/enums/user.role.enum';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>, // Module repository inject qilinmoqda
  ) { }

  async create(createLessonData: CreateLessonDto): Promise<{ statusCode: number, message: string, data?: Lesson }> {
    try {
      const moduleExists = await this.moduleRepository.findOne({ where: { id: createLessonData.moduleId } });
      if (!moduleExists) {
        const availableModules = await this.moduleRepository.find({ select: ["id", "name"] });
        return {
          statusCode: 400,
          message: `Module with ID ${createLessonData.moduleId} does not exist. Available modules are: ${availableModules.map(module => `ID: ${module.id}, Name: ${module.name}`).join('; ')}`
        };
      }

      const lesson = this.lessonRepository.create(createLessonData);
      const savedLesson = await this.lessonRepository.save(lesson);
      return { statusCode: 201, message: 'Lesson created successfully', data: savedLesson };
    } catch (error) {
      console.error('Error creating lesson:', error);
      return { statusCode: 500, message: `Error creating lesson: ${error.message}` };
    }
  }

 



  async findAll(userId: number, courseId: number, role: User_Role): Promise<{ statusCode: number, message: string, data?: { lessons: Lesson[], course: any } }> {
    try {
      let lessons;

      // Talaba rolida bo'lsa, ro'yxatdan o'tganligini tekshiramiz
      if (role === User_Role.Student) {
        const enrollment = await this.enrollmentRepository.findOne({ where: { student: { id: userId }, course: { id: courseId } } });
        if (!enrollment) {
          return { statusCode: 403, message: 'Siz bu kursda ro\'yxatdan o\'tmagan ekansiz' };
        }
      }

      // Kursni olish
      const course = await this.moduleRepository.findOne({ where: { id: courseId }, relations: ['lessons'] });

      // Agar kurs mavjud bo'lmasa, mavjud kurslar ro'yxatini olish
      if (!course) {
        const availableCourses = await this.moduleRepository.find({ select: ["id", "name"] });
        return {
          statusCode: 404,
          message: `Kurs ID ${courseId} topilmadi. Mavjud kurslar: ${availableCourses.map(course => `ID: ${course.id}, Nom: ${course.name}`).join('; ')}`
        };
      }

      // Darslarni kurs ID bilan topamiz
      lessons = await this.lessonRepository.find({ where: { module: { course: { id: courseId } } }, relations: ['module'] });

      return {
        statusCode: 200,
        message: 'Darslar muvaffaqiyatli olindi',
        data: {
          lessons: lessons,
          course: course
        }
      };
    } catch (error) {
      console.error('Darslarni olishda xato:', error);
      return { statusCode: 500, message: `Darslarni olishda xato: ${error.message}` };
    }
  }



  async findOne(id: number, userId: number, courseId: number, role: User_Role): Promise<{ statusCode: number, message: string, data?: Lesson }> {
    try {
      if (role === User_Role.Student) {
        const enrollment = await this.enrollmentRepository.findOne({ where: { student: { id: userId }, course: { id: courseId } } });
        if (!enrollment) {
          return { statusCode: 403, message: 'You are not enrolled in this course' };
        }
      }

      const lesson = await this.lessonRepository.findOne({ where: { id }, relations: ['module'] });
      if (!lesson) {
        const availableLessons = await this.lessonRepository.find({ select: ["id", "title"] });
        return {
          statusCode: 404,
          message: `Lesson with ID ${id} not found. Available lessons are: ${availableLessons.map(lesson => `ID: ${lesson.id}, Title: ${lesson.title}`).join('; ')}`
        };
      }

      return { statusCode: 200, message: 'Lesson fetched successfully', data: lesson };
    } catch (error) {
      console.error('Error fetching lesson:', error);
      return { statusCode: 500, message: `Error fetching lesson: ${error.message}` };
    }
  }


  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<{ statusCode: number, message: string, data?: Lesson }> {
    try {
      // moduleId tekshiruvi
      if (updateLessonDto.moduleId) {
        const moduleExists = await this.moduleRepository.findOne({ where: { id: updateLessonDto.moduleId } });
        if (!moduleExists) {
          const availableModules = await this.moduleRepository.find({ select: ["id", "name"] });
          return {
            statusCode: 400,
            message: `Module with ID ${updateLessonDto.moduleId} does not exist. Available modules are: ${availableModules.map(module => `ID: ${module.id}, Name: ${module.name}`).join('; ')}`
          };
        }
      }

      const lesson = await this.lessonRepository.preload({ id, ...updateLessonDto });
      if (!lesson) {
        const availableLessons = await this.lessonRepository.find({ select: ["id", "title"] });
        return {
          statusCode: 404,
          message: `Lesson with ID ${id} not found. Available lessons are: ${availableLessons.map(lesson => `ID: ${lesson.id}, Title: ${lesson.title}`).join('; ')}`
        };
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
        const availableLessons = await this.lessonRepository.find({ select: ["id", "title"] });
        return {
          statusCode: 404,
          message: `Lesson with ID ${id} not found. Available lessons are: ${availableLessons.map(lesson => `ID: ${lesson.id}, Title: ${lesson.title}`).join('; ')}`
        };
      }
      await this.lessonRepository.remove(lesson);
      return { statusCode: 200, message: 'Lesson deleted successfully' };
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { statusCode: 500, message: `Error deleting lesson: ${error.message}` };
    }
  }

}
