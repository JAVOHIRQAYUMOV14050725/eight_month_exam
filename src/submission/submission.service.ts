import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { User_Role } from 'src/enums/user.role.enum';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) { }

  async create(createSubmissionDto: CreateSubmissionDto, student: any): Promise<Submission> {
    try {
      const assignment = await this.assignmentRepository.findOne({ where: { id: createSubmissionDto.assignmentId } });
      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${createSubmissionDto.assignmentId} not found`);
      }

      const existingSubmission = await this.submissionRepository.findOne({ where: { assignment, student } });
      if (existingSubmission) {
        if (existingSubmission.score !== null) {
          throw new ForbiddenException('This submission has already been graded and cannot be modified');
        } else {
          Object.assign(existingSubmission, createSubmissionDto);
          return await this.submissionRepository.save(existingSubmission);
        }
      }

      const submission = this.submissionRepository.create({
        ...createSubmissionDto,
        assignment,
        student,
      });
      return await this.submissionRepository.save(submission);
    } catch (error) {
      console.error('Error creating submission:', error);
      throw new InternalServerErrorException('Error creating submission');
    }
  }

  async findAllByAssignment(assignmentId: number, user: any): Promise<Submission[]> {
    try {
      if (user.role === User_Role.Teacher) {
        return await this.submissionRepository.find({ where: { assignment: { id: assignmentId } }, relations: ['student'] });
      }
      return await this.submissionRepository.find({ where: { assignment: { id: assignmentId }, student: { id: user.id } }, relations: ['student'] });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw new InternalServerErrorException('Error fetching submissions');
    }
  }

  async findOneById(id: number, user: any): Promise<Submission> {
    try {
      const submission = await this.submissionRepository.findOne({ where: { id }, relations: ['student'] });
      if (!submission) {
        throw new NotFoundException(`Submission with ID ${id} not found`);
      }

      if (user.role !== User_Role.Teacher && submission.student.id !== user.id) {
        throw new ForbiddenException('You do not have permission to view this submission');
      }

      return submission;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw new InternalServerErrorException('Error fetching submission');
    }
  }

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto, user: any): Promise<Submission> {
    try {
      const submission = await this.submissionRepository.findOne({ where: { id }, relations: ['student'] });
      if (!submission) {
        throw new NotFoundException(`Submission with ID ${id} not found`);
      }

      if (user.role === User_Role.Teacher) {
        if (updateSubmissionDto.score !== undefined) submission.score = updateSubmissionDto.score;
        if (updateSubmissionDto.feedback !== undefined) submission.feedback = updateSubmissionDto.feedback;
      } else {
        if (submission.score !== null) {
          throw new ForbiddenException('This submission has already been graded and cannot be modified');
        }
        if (submission.student.id !== user.id) {
          throw new ForbiddenException('You do not have permission to update this submission');
        }
        if (updateSubmissionDto.assignmentId !== undefined) submission.assignment.id = updateSubmissionDto.assignmentId;
        if (updateSubmissionDto.content !== undefined) submission.content = updateSubmissionDto.content;
      }

      return await this.submissionRepository.save(submission);
    } catch (error) {
      console.error('Error updating submission:', error);
      throw new InternalServerErrorException('Error updating submission');
    }
  }
}
