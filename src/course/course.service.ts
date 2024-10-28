import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modules } from 'src/module/entities/module.entity';
import { Lesson } from 'src/lesson/entities/lesson.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Modules)
    private readonly modulesRepository: Repository<Modules>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
  ) { }

  // Yangi kurs yaratish
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      // Avval mavjud kursni tekshiradi
      const existingCourse = await this.courseRepository.findOne({
        where: { name: createCourseDto.name },
      });

      if (existingCourse) {
        throw new ConflictException(`Course with name ${createCourseDto.name} already exists.`);
      }

      // Yangi kursni yaratadi va saqlaydi
      const course = this.courseRepository.create(createCourseDto);
      await this.courseRepository.save(course);

      // Modullarni olish
      const modules = await this.modulesRepository.find({ where: { course: { id: course.id } } });

      // Har bir modul uchun darslarni olish
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await this.lessonsRepository.find({ where: { moduleId: module.id } });
          return { ...module, lessons }; // Modulga darslarni qo'shamiz
        })
      );

      // Kursni qaytaramiz
      return {
        ...course,
        modules: modulesWithLessons, // Yangi modullar va darslar
      };
    } catch (error) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  }




  // Barcha kurslarni modullari va modullarning darslari bilan birga olish
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
