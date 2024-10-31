
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Assignment } from '../assignment/entities/assignment.entity';
import { User_Role } from '../enums/user.role.enum';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    private readonly cache: Cache, // Injecting Cache
  ) { }

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto, user: any): Promise<Omit<Submission, 'student'>> {
    try {
      const submissionKey = `submission:${id}`;
      let submission = await this.cache.get<Submission>(submissionKey);

      if (!submission) {
        submission = await this.submissionRepository.findOne({
          where: { id },
          relations: ['student', 'assignment'],
        });

        if (!submission) {
          await this.handleSubmissionNotFound(updateSubmissionDto, user);
        } else {
          await this.cache.set(submissionKey, submission, 3600);

        }
      }

      if (user.role === User_Role.Teacher) {
        if (updateSubmissionDto.score !== undefined) {
          submission.score = updateSubmissionDto.score;
          submission.isGraded = true;
        }
        if (updateSubmissionDto.feedback !== undefined) submission.feedback = updateSubmissionDto.feedback;
      } else {
        if (submission.isGraded) {
          throw new ForbiddenException('This submission has already been graded and cannot be modified');
        }
        if (submission.student.id !== user.id) {
          throw new ForbiddenException('You are not allowed to update this submission');
        }
        if (updateSubmissionDto.assignmentId !== undefined) submission.assignment.id = updateSubmissionDto.assignmentId;
        if (updateSubmissionDto.content !== undefined) submission.content = updateSubmissionDto.content;
      }

      const updatedSubmission = await this.submissionRepository.save(submission);
      await this.cache.set(submissionKey, updatedSubmission , 3600);
      return this.excludeSensitiveInfo(updatedSubmission, user.role === User_Role.Teacher);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error updating submission', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(user: any): Promise<any> {
    if (!user || !user.id) {
      throw new ForbiddenException('User must be authenticated.');
    }

    const cacheKey = `submissions:${user.id}`;
    let submissions = await this.cache.get<any>(cacheKey);

    if (!submissions) {
      if (user.role === User_Role.Teacher) {
        submissions = await this.handleTeacherSubmissions();
      } else {
        submissions = await this.handleStudentSubmissions(user.id);
      }

      await this.cache.set(cacheKey, submissions, 3600);
    }

    return submissions;
  }

  async create(createSubmissionDto: CreateSubmissionDto, student: any): Promise<Omit<Submission, 'student'>> {
    try {
      const assignment = await this.assignmentRepository.findOne({ where: { id: createSubmissionDto.assignmentId } });
      if (!assignment) {
        const availableAssignments = await this.assignmentRepository.find();
        throw new NotFoundException({
          message: `Assignment with ID ${createSubmissionDto.assignmentId} not found.`,
          availableAssignments: availableAssignments.map(a => ({ id: a.id, description: a.description })),
        });
      }

      const existingSubmission = await this.submissionRepository.findOne({
        where: { assignment: { id: assignment.id }, student: { id: student.id } },
      });

      if (existingSubmission) {
        if (existingSubmission.isGraded) {
          throw new ForbiddenException('This submission has already been graded and cannot be modified or recreated.');
        } else {
          throw new ForbiddenException('You have already submitted an answer for this assignment. Please update it if needed.');
        }
      }

      const submission = this.submissionRepository.create({
        ...createSubmissionDto,
        assignment,
        student,
        isGraded: false,
      });

      const savedSubmission = await this.submissionRepository.save(submission);
      await this.cache.set(`submission:${savedSubmission.id}`, savedSubmission);
      return this.excludeSensitiveInfo(savedSubmission);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error creating submission', HttpStatus.BAD_REQUEST);
    }
  }

  private async handleSubmissionNotFound(updateSubmissionDto: UpdateSubmissionDto, user: any) {
    const assignmentId = updateSubmissionDto.assignmentId;

    if (user.role === User_Role.Student) {
      const existingSubmissions = await this.submissionRepository.find({
        where: { student: { id: user.id } },
        relations: ['assignment'],
      });
      const response = existingSubmissions.map(sub => ({
        id: sub.id,
        content: sub.content,
        assignmentId: sub.assignment.id,
        isGraded: sub.isGraded,
      }));

      throw new NotFoundException({
        message: `Your submission was not found. Here are your submissions:`,
        existingSubmissions: response,
      });
    }

    const allSubmissions = await this.submissionRepository.find({ relations: ['student', 'assignment'] });
    const response = allSubmissions.map(sub => ({
      id: sub.id,
      content: sub.content,
      student: { id: sub.student.id, name: sub.student.name, email: sub.student.email },
      assignmentId: sub.assignment.id,
      isGraded: sub.isGraded,
    }));

    throw new NotFoundException({
      message: `Submission not found. Here are the available submissions:`,
      availableSubmissions: response,
    });
  }

  private async handleTeacherSubmissions() {
    const submissions = await this.submissionRepository.find({ relations: ['student', 'assignment'] });
    const assignments = await this.assignmentRepository.find();

    const graded = submissions.filter(sub => sub.isGraded);
    const ungraded = submissions.filter(sub => !sub.isGraded && sub.content);
    const notSubmitted = assignments.filter(assignment =>
      !submissions.some(sub => sub.assignment.id === assignment.id)
    );

    const notSubmittedDetails = notSubmitted.map(assignment => ({
      assignmentId: assignment.id,
      assignmentDescription: assignment.description,
      dueDate: assignment.dueDate,
    }));

    return {
      graded: graded.map(sub => this.excludeSensitiveInfo(sub, true)),
      ungraded: ungraded.map(sub => this.excludeSensitiveInfo(sub, true)),
      notSubmitted: notSubmittedDetails,
    };
  }

  private async handleStudentSubmissions(studentId: number) {
    const submissions = await this.submissionRepository.find({ where: { student: { id: studentId } }, relations: ['assignment'] });
    const assignments = await this.assignmentRepository.find();

    const graded = submissions.filter(sub => sub.isGraded);
    const ungraded = submissions.filter(sub => !sub.isGraded && sub.content);
    const notSubmitted = assignments.filter(assignment =>
      !submissions.some(sub => sub.assignment.id === assignment.id)
    );

    const notSubmittedDetails = notSubmitted.map(assignment => ({
      assignmentId: assignment.id,
      assignmentDescription: assignment.description,
      dueDate: assignment.dueDate,
    }));

    return {
      graded: graded.map(sub => this.excludeSensitiveInfo(sub)),
      ungraded: ungraded.map(sub => this.excludeSensitiveInfo(sub)),
      notSubmitted: notSubmittedDetails,
    };
  }


  private excludeSensitiveInfo(submission: Submission, includeStudentInfo: boolean = false): any {
    const { id, score, feedback, submissionDate, content, assignment, student, isGraded } = submission;
    const safeStudent = includeStudentInfo && student
      ? { id: student.id, name: student.name, email: student.email }
      : undefined;

    return { id, score, feedback, submissionDate, content, assignment, student: safeStudent, isGraded };
  }

}



