import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
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
        const availableModules = await this.moduleRepository.find();
        throw new NotFoundException({
          message: `Module ${moduleId} not found.`,
          error: `Here are the available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`,
          statusCode: 404
        });
      }

      const existingAssignment = await this.assignmentRepository.findOne({
        where: {
          module: { id: moduleId },
          description: createAssignmentDto.description
        }
      });

      if (existingAssignment) {
        throw new ConflictException({
          message: 'Failed to create assignment',
          error: 'Assignment with this description already exists in the module',
          statusCode: 409
        });
      }

      const assignment = this.assignmentRepository.create({
        ...createAssignmentDto,
        module,
      });
      return await this.assignmentRepository.save(assignment);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Failed to create assignment',
        error: error.message,
        statusCode: 500
      });
    }
  }

  async findAll(moduleId: number): Promise<Assignment[]> {
    const module = await this.moduleRepository.findOne({ where: { id: moduleId } });

    if (!module) {
      const availableModules = await this.moduleRepository.find();
      throw new NotFoundException({
        message: `Module ${moduleId} not found.`,
        error: `Here are the available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`,
        statusCode: 404
      });
    }

    try {
      return await this.assignmentRepository.find({
        where: { module: { id: moduleId } },
        relations: ['module'],
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Failed to fetch assignments',
        error: error.message,
        statusCode: 500
      });
    }
  }





  async findOne(id: number): Promise<Assignment> {
    try {
      const assignment = await this.assignmentRepository.findOne({ where: { id }, relations: ['module'] });
      if (!assignment) {
        const availableAssignments = await this.assignmentRepository.find();
        throw new NotFoundException({
          message: `Assignment with ID ${id} not found.`,
          error: `Here are the available assignments: ${availableAssignments.map(assign => `ID: ${assign.id}, Description: ${assign.description}`).join('; ')}`,
          statusCode: 404
        });
      }
      return assignment;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to fetch assignment with ID ${id}`,
        error: error.message,
        statusCode: 500
      });
    }
  }

  async update(id: number, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    try {
      const assignment = await this.assignmentRepository.findOne({ where: { id }, relations: ['module'] });
      if (!assignment) {
        const availableAssignments = await this.assignmentRepository.find();
        throw new NotFoundException({
          message: `Assignment with ID ${id} not found.`,
          error: `Here are the available assignments: ${availableAssignments.map(assign => `ID: ${assign.id}, Description: ${assign.description}`).join('; ')}`,
          statusCode: 404
        });
      }

      const module = await this.moduleRepository.findOne({ where: { id: assignment.module.id } });
      if (!module) {
        const availableModules = await this.moduleRepository.find();
        throw new NotFoundException({
          message: `Module ${assignment.module.id} not found.`,
          error: `Here are the available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`,
          statusCode: 404
        });
      }

      Object.assign(assignment, updateAssignmentDto);
      return await this.assignmentRepository.save(assignment);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Failed to update assignment',
        error: error.message,
        statusCode: 500
      });
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const assignment = await this.findOne(id);
      if (!assignment) {
        throw new NotFoundException({
          message: `Assignment with ID ${id} not found`,
          error: 'Assignment not found',
          statusCode: 404
        });
      }

      const module = await this.moduleRepository.findOne({ where: { id: assignment.module.id } });
      if (!module) {
        const availableModules = await this.moduleRepository.find();
        throw new NotFoundException({
          message: `Module ${assignment.module.id} not found.`,
          error: `Here are the available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`,
          statusCode: 404
        });
      }

      await this.assignmentRepository.remove(assignment);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Failed to delete assignment',
        error: error.message,
        statusCode: 500
      });
    }
  }
}
