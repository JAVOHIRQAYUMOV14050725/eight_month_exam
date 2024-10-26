  import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
  import { CreateCourseDto } from './dto/create-course.dto';
  import { UpdateCourseDto } from './dto/update-course.dto';
  import { Course } from './entities/course.entity';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';

  @Injectable()
  export class CourseService {
    constructor(
      @InjectRepository(Course)
      private readonly courseRepository: Repository<Course>,
    ) { }

    async create(createCourseDto: CreateCourseDto): Promise<Course> {
      const existingCourse = await this.courseRepository.findOne({
        where: { name: createCourseDto.name },
      });

      if (existingCourse) {
        throw new ConflictException(`Course with name ${createCourseDto.name} already exists.`);
      }

      const course = this.courseRepository.create(createCourseDto);
      return await this.courseRepository.save(course);
    }

    async findAll(): Promise<Course[]> {
      return await this.courseRepository.find();
    }

    async findOne(id: number): Promise<Course> {
      const course = await this.courseRepository.findOne({ where: { id } });
      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found.`);
      }
      return course;
    }

    async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
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
    }

    async remove(id: number): Promise<void> {
      const course = await this.findOne(id);
      await this.courseRepository.remove(course);
    }
  }
