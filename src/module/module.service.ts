import { Injectable, NotFoundException, InternalServerErrorException, Inject,  } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async create(createModuleDto: CreateModuleDto, user: any) {
    if (createModuleDto.courseId) {
      const existingCourse = await this.courseRepository.findOne({ where: { id: createModuleDto.courseId } });
      if (!existingCourse) {
        const availableCourses = await this.courseRepository.find({ select: ['id', 'name'] });
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

      await this.cacheManager.del(`module_${module.id}`);
      await this.cacheManager.del(`all_modules`);

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
    const cacheKey = `lessons_module_${moduleId}`;
    const cachedLessons = await this.cacheManager.get(cacheKey);
    if (cachedLessons) return cachedLessons;

    try {
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
        relations: ['lessons'],
      });

      if (!module) {
        const availableModules = await this.moduleRepository.find({ select: ['id', 'name'] });
        return {
          statusCode: 404,
          message: `Module ${moduleId} not found`,
          availableModules,
        };
      }

      const response = {
        message: `Lessons for module ${moduleId} successfully fetched`,
        data: module.lessons,
      };
      await this.cacheManager.set(cacheKey, response,3600);

      return response;
    } catch (error) {
      return {
        statusCode: 500,
        message: 'An error occurred while fetching lessons',
        error: error.message,
      };
    }
  }

  async findOne(id: number) {
    const cacheKey = `module_${id}`;
    const cachedModule = await this.cacheManager.get(cacheKey);
    if (cachedModule) return cachedModule;

    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      const availableModules = await this.moduleRepository.find({ select: ['id', 'name'] });
      return {
        message: `Module ${id} not found`,
        availableModules,
      };
    }

    const response = { message: `Module ${id} successfully fetched`, data: module };
    await this.cacheManager.set(cacheKey, response, 3600);

    return response;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto, user: any) {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      const availableModules = await this.moduleRepository.find({ select: ['id', 'name'] });
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

      await this.cacheManager.del(`module_${id}`);
      await this.cacheManager.del(`all_modules`);

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
      const availableModules = await this.moduleRepository.find({ select: ['id', 'name'] });
      return {
        statusCode: 404,
        message: `Module ${id} not found`,
        availableModules,
      };
    }

    try {
      await this.moduleRepository.remove(module);

      await this.cacheManager.del(`module_${id}`);
      await this.cacheManager.del(`all_modules`);

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
