import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Modules } from '../module/entities/module.entity';

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
      // Modulni topish
      const module = await this.moduleRepository.findOne({ where: { id: moduleId }, relations: ['course'] });

      if (!module) {
        const availableModules = await this.moduleRepository.find();
        throw new NotFoundException({
          message: `Module ${moduleId} not found.`,
          error: availableModules.length
            ? `Here are the available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`
            : 'Currently, there are no available modules.',
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
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to create assignment',
        error: error.message,
        statusCode: 500
      });
    }
  }


  async findAll(moduleId: number): Promise<Assignment[]> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
      relations: ['course']
    });

    if (!module) {
      const availableModules = await this.moduleRepository.find();
      throw new NotFoundException({
        message: `Module ${moduleId} not found.`,
        error: availableModules.length
          ? `Available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`
          : 'Currently, there are no available modules.',
        statusCode: 404,
      });
    }

    const assignments = await this.assignmentRepository.find({
      where: { module: { id: moduleId } },
      relations: ['module'],
    });

    if (!assignments.length) {
      throw new NotFoundException({
        message: `No assignments found for module ${moduleId}.`,
        error: 'Currently, there are no assignments available for this module.',
        statusCode: 404,
      });
    }

    return assignments; 
  }

  async findOne(id: number): Promise<Assignment> {
    try {

      const assignment = await this.assignmentRepository.findOne({ where: { id }, relations: ['module'] });

      if (assignment) {
        return assignment; 
      }
      const availableAssignments = await this.assignmentRepository.find();
      console.log('Available assignments:', availableAssignments);

      throw new NotFoundException({
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: `/assignments/${id}`,
        message: `Assignment with ID ${id} not found.`,
        suggestions: availableAssignments.length
          ? `Available assignments: ${availableAssignments.map(assign => `ID: ${assign.id}, Description: ${assign.description}`).join('; ')}`
          : 'Currently, there are no available assignments.'
      });

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException({
        statusCode: 500,
        path: `/assignments/${id}`,
        message: `Failed to fetch assignment with ID ${id}.`,
        error: 'An internal server error occurred. Please try again later.'
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
          error: availableAssignments.length
            ? `Here are the available assignments: ${availableAssignments.map(assign => `ID: ${assign.id}, Description: ${assign.description}`).join('; ')}`
            : 'Currently, there are no available assignments.',
          statusCode: 404,
        });
      }

      const module = await this.moduleRepository.findOne({ where: { id: assignment.module.id } });
      if (!module) {
        const availableModules = await this.moduleRepository.find();
        throw new NotFoundException({
          message: `Module ${assignment.module.id} not found.`,
          error: availableModules.length
            ? `Here are the available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`
            : 'Currently, there are no available modules.',
          statusCode: 404,
        });
      }

      Object.assign(assignment, updateAssignmentDto);
      return await this.assignmentRepository.save(assignment);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; 
      }
      throw new InternalServerErrorException({
        message: 'Failed to update assignment',
        error: error.message,
        statusCode: 500
      });
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const assignment = await this.assignmentRepository.findOne({ where: { id }, relations: ['module'] });

      if (!assignment) {
        const availableAssignments = await this.assignmentRepository.find();
        throw new NotFoundException({
          message: `Assignment with ID ${id} not found.`,
          error: availableAssignments.length
            ? `Here are the available assignments: ${availableAssignments.map(assign => `ID: ${assign.id}, Description: ${assign.description}`).join('; ')}`
            : 'Currently, there are no available assignments.',
          statusCode: 404,
        });
      }

      const module = await this.moduleRepository.findOne({ where: { id: assignment.module.id } });
      if (!module) {
        const availableModules = await this.moduleRepository.find();
        throw new NotFoundException({
          message: `Module ${assignment.module.id} not found.`,
          error: availableModules.length
            ? `Here are the available modules: ${availableModules.map(mod => `ID: ${mod.id}, Name: ${mod.name}`).join('; ')}`
            : 'Currently, there are no available modules.',
          statusCode: 404,
        });
      }

      await this.assignmentRepository.remove(assignment);
      return { message: `Assignment with ID ${id} has been successfully deleted.` };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error; 
      }
      throw new InternalServerErrorException({
        message: 'Failed to delete assignment',
        error: error.message,
        statusCode: 500
      });
    }
  }
}
