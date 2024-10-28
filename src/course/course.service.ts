import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modules } from 'src/module/entities/module.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Injectable()
export class CourseService {
  findByName(value: any) {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Modules)
    private readonly modulesRepository: Repository<Modules>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
  ) { }



  async findModulesByCourseId(courseId: number) {
    try {
      const modules = await this.modulesRepository.find({
        where: { course: { id: courseId } },
        relations: ['lessons'],
      });

      if (!modules || modules.length === 0) {
        return {
          statusCode: 404,
          message: `Modules for course ID ${courseId} not found`
        };
      }

      return {
        message: `Modules for course ${courseId} successfully fetched`,
        data: modules,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'An error occurred while fetching modules',
        error: error.message
      };
    }
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

      const modules = await this.modulesRepository.find({ where: { course: { id: course.id } } });

      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await this.lessonsRepository.find({ where: { moduleId: module.id } });
          return { ...module, lessons };
        })
      );

      return {
        ...course,
        modules: modulesWithLessons, 
      };
    } catch (error) {
      throw new InternalServerErrorException(`Error creating course: ${error.message}`);
    }
  }

  async findAll(): Promise<Course[]> {
    try {
      return await this.courseRepository.find({
        relations: ['modules', 'modules.lessons'],
      });
    } catch (error) {
      throw new Error(`Error fetching courses: ${error.message}`);
    }
  }

  // Kursni ID bo'yicha modullari va modullarning darslari bilan olish
  async findOne(id: number): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['modules', 'modules.lessons'],
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found.`);
      }
      return course;
    } catch (error) {
      throw new Error(`Error fetching course with ID ${id}: ${error.message}`);
    }
  }

  // Kursni yangilash
  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    try {
      const course = await this.findOne(id);

      if (updateCourseDto.name) {
        const existingCourse = await this.courseRepository.findOne({
          where: { name: updateCourseDto.name },
        });

        if (existingCourse && existingCourse.id !== id) {
          throw new ConflictException(`Course with name ${updateCourseDto.name} already exists.`);
        }
      }

      await this.courseRepository.update(id, updateCourseDto);
      return this.findOne(id);
    } catch (error) {
      throw new Error(`Error updating course with ID ${id}: ${error.message}`);
    }
  }

  // Kursni o'chirish
  async remove(id: number): Promise<void> {
    try {
      const course = await this.findOne(id);
      await this.courseRepository.remove(course);
    } catch (error) {
      throw new Error(`Error removing course with ID ${id}: ${error.message}`);
    }
  }
}
