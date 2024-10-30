import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class ModuleService {

  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) { }

  async create(createModuleDto: CreateModuleDto, user: any) {
    if (createModuleDto.courseId) {
      const existingCourse = await this.courseRepository.findOne({ where: { id: createModuleDto.courseId } });
      if (!existingCourse) {
        const availableCourses = await this.courseRepository.find({
          select: ['id', 'name'], // Faqat id va name maydonlarini tanlash
        });
        return {
          statusCode: 404,
          message: `Course with ID ${createModuleDto.courseId} not found.`,
          availableCourses,
        };
      }
    }

    const module = this.moduleRepository.create(createModuleDto);
    try {
      await this.moduleRepository.save(module);
      return { message: 'Module successfully created', data: module };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Failed to create module',
        error: error.message,
      };
    }
  }



  async findLessonsByModuleId(moduleId: number) {
    try {
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
        relations: ['lessons'],
      });
      if (!module) {
        const availableModules = await this.moduleRepository.find({
          select: ['id', 'name'], 
        });
        return {
          statusCode: 404,
          message: `Module ${moduleId} not found`,
          availableModules,
        };
      }
      return {
        message: `Lessons for module ${moduleId} successfully fetched`,
        data: module.lessons,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'An error occurred while fetching lessons',
        error: error.message,
      };
    }
  }

  async findOne(id: number) {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      const availableModules = await this.moduleRepository.find({
        select: ['id', 'name'], // Faqat id va name maydonlarini tanlash
      });
      return {
        message: `Module ${id} not found`,
        availableModules,
      };
    }
    return { message: `Module ${id} successfully fetched`, data: module };
  }

  async update(id: number, updateModuleDto: UpdateModuleDto, user: any) {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      const availableModules = await this.moduleRepository.find({
        select: ['id', 'name'], // Faqat id va name maydonlarini tanlash
      });
      return {
        statusCode: 404,
        message: `Module ${id} not found`,
        availableModules,
      };
    }
    try {
      const updatedModule = await this.moduleRepository.save({
        ...module,
        ...updateModuleDto,
      });
      return { message: `Module ${id} successfully updated`, data: updatedModule };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Failed to update the module',
        error: error.message,
      };
    }
  }

  async remove(id: number, user: any) {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      const availableModules = await this.moduleRepository.find({
        select: ['id', 'name'], // Faqat id va name maydonlarini tanlash
      });
      return {
        statusCode: 404,
        message: `Module ${id} not found`,
        availableModules,
      };
    }
    try {
      await this.moduleRepository.remove(module);
      return { message: `Module ${id} successfully deleted` };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Failed to delete the module',
        error: error.message,
      };
    }
  }
}
