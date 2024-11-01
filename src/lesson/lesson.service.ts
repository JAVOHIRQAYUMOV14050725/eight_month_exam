import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException, Inject, } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Modules } from '../module/entities/module.entity';
import { User_Role } from '../enums/user.role.enum';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }
  async create(createLessonData: CreateLessonDto): Promise<{ statusCode: number, message: string, data?: Lesson | any }> {
    try {
      const moduleExists = await this.moduleRepository.findOne({ where: { id: createLessonData.moduleId } });

      if (!moduleExists) {
        return await this.moduleNotFoundResponses();
      }

      const lesson = this.lessonRepository.create(createLessonData);
      const savedLesson = await this.lessonRepository.save(lesson);

      // Yangi yaratilgan darsni keshga saqlash
      await this.cacheManager.set(`lesson-${savedLesson.id}`, savedLesson);

      return { statusCode: 201, message: 'Dars muvaffaqiyatli yaratildi', data: savedLesson };
    } catch (error) {
      console.error('Dars yaratishda xato:', error);
      throw new InternalServerErrorException(`Dars yaratishda xato: ${error.message}`);
    }
  }

  // Modul mavjud bo'lmaganda javob qaytarish uchun yordamchi metod
  private async moduleNotFoundResponses(): Promise<{ statusCode: number; message: string; data: any }> {
    const availableModules = await this.moduleRepository.find({
      select: ['id', 'name']
    });

    const modulesData = availableModules.map(module => ({
      id: module.id,
      name: module.name
    }));

    return {
      statusCode: 404,
      message: `Noto'g'ri Module ID kiritildi. Mavjud module'lar:`,
      data: modulesData.length > 0 ? modulesData : []
    };
  }



  async findOne(id: number, userId: number, courseId: number, role: User_Role): Promise<{ statusCode: number, message: string, data?: Lesson | any }> {
    try {
      // Teacher yoki Admin roli uchun cheklovlarni olib tashlash va obuna tekshirmaslik
      if (role === User_Role.Student) {
        const enrollment = await this.enrollmentRepository.findOne({
          where: { student: { id: userId }, course: { id: courseId } }
        });

        if (!enrollment) {
          const enrolledCourses = await this.enrollmentRepository.find({
            where: { student: { id: userId } },
            relations: ['course']
          });

          const coursesData = enrolledCourses.map(enrollment => ({
            id: enrollment.course.id,
            name: enrollment.course.name
          }));

          const availableCourses = await this.courseRepository.find();
          const availableCoursesData = availableCourses.map(course => ({
            id: course.id,
            name: course.name
          }));

          return {
            statusCode: 403,
            message: 'Siz bu kursda ro‘yxatdan o‘tmagan ekansiz. Siz obuna bo‘lgan kurslarni ko‘ring.',
            data: {
              enrolledCourses: coursesData,
              availableCourses: availableCoursesData.filter(course => !coursesData.some(enrolled => enrolled.id === course.id))
            }
          };
        }
      }

      // Course mavjudligini tekshirish
      const courseExists = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!courseExists) {
        const availableCourses = await this.courseRepository.find({
          select: ['id', 'name']
        });
        const coursesData = availableCourses.map(course => ({
          id: course.id,
          name: course.name
        }));

        return {
          statusCode: 404,
          message: 'Noto‘g‘ri Course ID kiritildi. Mavjud kurslar ro‘yxati:',
          data: coursesData.length > 0 ? coursesData : [{ message: 'Kurslar hozircha mavjud emas.' }]
        };
      }

      // Lessonni cache orqali olish yoki database dan qidirish
      let lesson = await this.getLessonFromCache(id);
      if (!lesson) {
        lesson = await this.lessonRepository.findOne({ where: { id, module: { course: { id: courseId } } }, relations: ['module'] });

        // Lesson mavjudligini tekshirish
        if (!lesson) {
          const availableLessons = await this.lessonRepository.find({
            where: { module: { course: { id: courseId } } },
            select: ['id', 'title']
          });
          const lessonsData = availableLessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title
          }));

          return {
            statusCode: 404,
            message: `Noto'g'ri Lesson ID kiritildi. Mavjud darslar ro'yxati:`,
            data: lessonsData.length > 0 ? lessonsData : [{ message: 'Lesson hozircha mavjud emas.' }]
          };
        }

        await this.cacheLesson(lesson);
      }

      return { statusCode: 200, message: 'Dars muvaffaqiyatli topildi', data: lesson };

    } catch (error) {
      throw new InternalServerErrorException(`Darsni olishda xato: ${error.message}`);
    }
  }





  private async cacheLesson(lesson: Lesson): Promise<void> {
    await this.cacheManager.set(`lesson-${lesson.id}`, lesson);
  }


  async getLessonFromCache(id: number): Promise<Lesson | null> {
    const lesson = await this.cacheManager.get<Lesson>(`lesson-${id}`);
    return lesson || null; // Return null if lesson is not found in cache
  }




  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<{ statusCode: number, message: string, data?: Lesson }> {
    try {
      if (updateLessonDto.moduleId) {
        const moduleExists = await this.moduleRepository.findOne({ where: { id: updateLessonDto.moduleId } });
        if (!moduleExists) {
          return this.moduleNotFoundResponse(updateLessonDto.moduleId);
        }
      }

      const lesson = await this.lessonRepository.preload({ id, ...updateLessonDto });
      if (!lesson) {
        return this.lessonNotFoundResponse(id);
      }

      const updatedLesson = await this.lessonRepository.save(lesson);

      // Updating the cache
      await this.cacheManager.set(`lesson-${updatedLesson.id}`, updatedLesson);

      return { statusCode: 200, message: 'Lesson updated successfully', data: updatedLesson };
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw new InternalServerErrorException(`Error updating lesson: ${error.message}`);
    }
  }

  async remove(id: number): Promise<{ statusCode: number, message: string }> {
    try {
      const lesson = await this.lessonRepository.findOne({ where: { id } });
      if (!lesson) {
        return this.lessonNotFoundResponse(id);
      }
      await this.lessonRepository.remove(lesson);

      // Removing the lesson from cache
      await this.cacheManager.del(`lesson-${id}`);

      return { statusCode: 200, message: 'Lesson deleted successfully' };
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw new InternalServerErrorException(`Error deleting lesson: ${error.message}`);
    }
  }


  // Helper methods for responses
  private moduleNotFoundResponse(moduleId: number) {
    return {
      statusCode: 400,
      message: `Module with ID ${moduleId} does not exist.`
    };
  }

  private courseNotFoundResponse(courseId: number) {
    return {
      statusCode: 404,
      message: `Kurs ID ${courseId} topilmadi.`
    };
  }

  private lessonNotFoundResponse(id: number) {
    return {
      statusCode: 404,
      message: `Lesson with ID ${id} not found.`
    };
  }



}
