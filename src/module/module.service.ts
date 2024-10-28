import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) { }

  async create(createModuleDto: CreateModuleDto, user: any) {
    const module = this.moduleRepository.create(createModuleDto);
    try {
      await this.moduleRepository.save(module);
      return { message: 'Module successfully created', data: module };
    } catch {
      return { message: 'Failed to create module', status: 400 }; 
    }
  }

  async findAll() {
    try {
      const modules = await this.moduleRepository.find();
      return { message: 'Modules successfully fetched', data: modules };
    } catch {
      return { message: 'Failed to fetch modules', status: 400 }; 
    }
  }

  async findOne(id: number) {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      return { message: `Module ${id} not found`, status: 404 }; 
    }
    return { message: `Module ${id} successfully fetched`, data: module };
  }

  async update(id: number, updateModuleDto: UpdateModuleDto, user: any) {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      return { message: `Module ${id} not found`, status: 404 };
    }

    try {
      const updatedModule = await this.moduleRepository.save({
        ...module,
        ...updateModuleDto,
      });
      return { message: `Module ${id} successfully updated`, data: updatedModule };
    } catch {
      return { message: 'Failed to update the module', status: 400 };
    }
  }

  async remove(id: number, user: any) {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      return { message: `Module ${id} not found`, status: 404 }; 
    }

    try {
      await this.moduleRepository.remove(module);
      return { message: `Module ${id} successfully deleted` };
    } catch {
      return { message: 'Failed to delete the module', status: 400 }; 
    }
  }
}
