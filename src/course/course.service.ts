import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { Modules } from '../module/entities/module.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';

@Injectable()
export class CourseService {


 
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Modules)
    private readonly modulesRepository: Repository<Modules>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  private async getAvailableCourses() {
    const courses = await this.courseRepository.find({ select: ['id', 'name'] });
    return courses
      .map(course => `{ Name: ${course.name}, ID: ${course.id} }`)
      .join(', ');
  }




  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      const existingCourse = await this.courseRepository.findOne({
        where: { name: createCourseDto.name },
      });
      if (existingCourse) {
        throw new ConflictException(`Course with name "${createCourseDto.name}" already exists.`);
      }
      const course = this.courseRepository.create(createCourseDto);
      await this.courseRepository.save(course);

      await this.cacheManager.del(`course:${course.id}`);

      const modules = await this.modulesRepository.find({ where: { course: { id: course.id } } });
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await this.lessonsRepository.find({ where: { moduleId: module.id } });
          return { ...module, lessons };
        })
      );
      return { ...course, modules: modulesWithLessons };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(isRegistered: boolean): Promise<any[]> {
    try {
      const courses = await this.courseRepository.find({ relations: ['modules'] });
      return await Promise.all(
        courses.map(async (course) => {
          const modulesWithLessons = await Promise.all(
            course.modules.map(async (module) => {
              const lessons = isRegistered
                ? await this.lessonsRepository.find({ where: { moduleId: module.id } })
                : [];
              return { ...module, lessons: lessons.length ? lessons : [] };
            })
          );
          return {
            id: course.id,
            name: course.name,
            description: course.description,
            price: course.price,
            category: course.category,
            level: course.level,
            createdAt: course.createdAt,
            modules: isRegistered ? modulesWithLessons : course.modules.length,
          };
        })
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number, isRegistered: boolean): Promise<any> {
    try {
      const cacheKey = `course:${id}`;
      const cachedCourse = await this.cacheManager.get(cacheKey);

      // Cast cachedCourse to string before parsing
      if (cachedCourse) {
        return JSON.parse(cachedCourse as string);
      }

      const course = await this.courseRepository.findOne({ where: { id }, relations: ['modules'] });
      if (!course) {
        const availableCourses = await this.getAvailableCourses();
        throw new NotFoundException(`Course with ID ${id} not found. Available Courses: ${availableCourses}`);
      }

      await this.cacheManager.set(cacheKey, JSON.stringify(course), 3600);
      return course;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findModulesByCourseId(courseId: number, userId: number, isRegistered: boolean): Promise<any> {
    try {
      const cacheKey = `course_modules:${courseId}`;
      const cachedModules = await this.cacheManager.get(cacheKey);

      if (cachedModules) {
        return JSON.parse(cachedModules as string);
      }

      const course = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        const availableCourses = await this.getAvailableCourses();
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Course with ID ${courseId} not found. Available Courses: ${JSON.stringify(availableCourses)}`,
        });
      }

      const enrollment = await this.enrollmentRepository.findOne({
        where: { courseId: courseId, userId: userId } 
      });

      const isRegistered = !!enrollment; 

      const modules = await this.modulesRepository.find({ where: { course: { id: courseId } } });
      if (modules.length === 0) {
        return { message: 'Bu kursda hozircha modul mavjud emas.' };
      }

      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = isRegistered
            ? await this.lessonsRepository.find({ where: { moduleId: module.id } })
            : [];
          return { ...module, lessons: lessons.length ? lessons : [] }; 
        })
      );

      const courseData = {
        id: course.id,
        name: course.name,
        description: course.description,
        price: course.price,
        category: course.category,
        level: course.level,
        createdAt: course.createdAt,
        modules: modulesWithLessons,
      };

      await this.cacheManager.set(cacheKey, JSON.stringify(courseData), 3600);
      return courseData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }





  async update(id: number, updateCourseDto: UpdateCourseDto, isRegistered: boolean): Promise<any> {
    try {
      const course = await this.courseRepository.findOne({ where: { id } });
      if (!course) {
        const availableCourses = await this.getAvailableCourses();
        throw new NotFoundException(`Course with ID ${id} not found. Available Courses: ${availableCourses}`);
      }

      Object.assign(course, updateCourseDto);
      await this.courseRepository.save(course);

      await this.cacheManager.del(`course:${course.id}`);

      return course;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number, isRegistered: boolean): Promise<void> {
    try {
      const course = await this.findOne(id, isRegistered);
      await this.courseRepository.remove(course);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findCourseByName(name: string): Promise<Course[]> {
    try {
      const lowerCaseName = name.toLowerCase();

      const courses = await this.courseRepository.find({
        where: {
          name: ILike(`%${lowerCaseName}%`),
          
        },
      });
      console.log(lowerCaseName);
      

      if (courses.length === 0) {
        console.log(name);
        
        throw new NotFoundException(`Kurs "${name}" topilmadi.`);
      }

      return courses;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }




}




