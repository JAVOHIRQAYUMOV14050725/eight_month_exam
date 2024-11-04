import { Injectable, NotFoundException, InternalServerErrorException, Inject } from '@nestjs/common';
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
      throw new InternalServerErrorException('Failed to create module');
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

      const availableModules = await this.moduleRepository.find({ select: ['id', 'name'] });

      if (!module) {
        return {
          statusCode: 404,
          message: `Module ${moduleId} not found`,
          availableModules,
        };
      }

      const response = {
        message: `Lessons for module ${moduleId} successfully fetched`,
        data: module.lessons.length > 0 ? module.lessons : 'No lessons found. Available lessons: ' + availableModules.map(mod => ({ id: mod.id, name: mod.name })),
      };
      await this.cacheManager.set(cacheKey, response, 3600);

      return response;
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching lessons');
    }
  }


  async findAll() {
    try {
      const modules = await this.moduleRepository.find({ select: ['id', 'name'] });
      return { message: 'Modules successfully fetched', data: modules };
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching modules');
    }
  }

  async findOne(id: number) {
    const cacheKey = `module_${id}`;
    const cachedModule = await this.cacheManager.get(cacheKey);
    if (cachedModule) return cachedModule;

    try {
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
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching the module');
    }
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
      throw new InternalServerErrorException('Failed to update the module');
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
      throw new InternalServerErrorException('Failed to delete the module');
    }
  }
}
