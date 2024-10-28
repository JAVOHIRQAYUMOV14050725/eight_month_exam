import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Modules } from 'src/module/entities/module.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) { }

  async create(moduleId: number, createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    try {
      const module = await this.moduleRepository.findOne({ where: { id: moduleId } });
      if (!module) {
        throw new NotFoundException(`Module ${moduleId} not found`);
      }
      const assignment = this.assignmentRepository.create({
        ...createAssignmentDto,
        module,
      });
      return await this.assignmentRepository.save(assignment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create assignment', error.message);
    }
  }

  async findAll(moduleId: number): Promise<Assignment[]> {
    try {
      return await this.assignmentRepository.find({
        where: { module: { id: moduleId } },
        relations: ['module'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch assignments', error.message);
    }
  }

  async findOne(id: number): Promise<Assignment> {
    try {
      const assignment = await this.assignmentRepository.findOne({ where: { id } });
      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${id} not found`);
      }
      return assignment;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch assignment with ID ${id}`, error.message);
    }
  }

  async update(id: number, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    try {
      const assignment = await this.findOne(id);
      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${id} not found`);
      }
      Object.assign(assignment, updateAssignmentDto);
      return await this.assignmentRepository.save(assignment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update assignment', error.message);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const assignment = await this.findOne(id);
      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${id} not found`);
      }
      await this.assignmentRepository.remove(assignment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete assignment', error.message);
    }
  }
}
