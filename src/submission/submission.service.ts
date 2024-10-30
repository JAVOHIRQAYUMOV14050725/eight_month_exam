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


  

  // Submissionni yangilash funksiyasi
  async update(id: number, updateSubmissionDto: UpdateSubmissionDto, user: any): Promise<Omit<Submission, 'student'>> {
    try {
      const submission = await this.submissionRepository.findOne({
        where: { id },
        relations: ['student', 'assignment'],
      });

      if (!submission) {
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
            message: `Sizning submissioningiz topilmadi. Mana sizning submissionlaringiz:`,
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
          message: `Submission topilmadi. Mana mavjud submissionlar:`,
          availableSubmissions: response,
        });
      }

      if (user.role === User_Role.Teacher) {
        if (updateSubmissionDto.score !== undefined) {
          submission.score = updateSubmissionDto.score;
          submission.isGraded = true; // Baholangani qayd qilish
        }
        if (updateSubmissionDto.feedback !== undefined) submission.feedback = updateSubmissionDto.feedback;
      } else {
        if (submission.isGraded) {
          throw new ForbiddenException('This submission has already been graded and cannot be modified');
        }
        if (submission.student.id !== user.id) {
          throw new ForbiddenException('Bu submissionni yangilashga ruxsat yo‘q');
        }
        if (updateSubmissionDto.assignmentId !== undefined) submission.assignment.id = updateSubmissionDto.assignmentId;
        if (updateSubmissionDto.content !== undefined) submission.content = updateSubmissionDto.content;
      }

      const updatedSubmission = await this.submissionRepository.save(submission);
      return this.excludeSensitiveInfo(updatedSubmission, user.role === User_Role.Teacher);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Submissionni yangilashda xatolik yuz berdi', HttpStatus.BAD_REQUEST);
    }
  }


  async findAll(user: any): Promise<any> {
    if (!user || !user.id) {
      throw new ForbiddenException('User must be authenticated.');
    }

    // O'qituvchi bo'lsa
    if (user.role === User_Role.Teacher) {
      const submissions = await this.submissionRepository.find({ relations: ['student', 'assignment'] });
      const assignments = await this.assignmentRepository.find(); // Barcha vazifalarni olish

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
    } else { // Talaba bo'lsa
      const submissions = await this.submissionRepository.find({ where: { student: { id: user.id } }, relations: ['assignment'] });
      const assignments = await this.assignmentRepository.find(); // Barcha vazifalarni olish

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
  }









  async create(createSubmissionDto: CreateSubmissionDto, student: any): Promise<Omit<Submission, 'student'>> {
    try {
      // Check if the assignment exists
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
      return this.excludeSensitiveInfo(savedSubmission);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error creating submission', HttpStatus.BAD_REQUEST);
    }
  }




  private excludeSensitiveInfo(submission: Submission, includeStudentInfo: boolean = false): any {
    const { id, score, feedback, submissionDate, content, assignment, student, isGraded } = submission;
    const safeStudent = includeStudentInfo && student
      ? { id: student.id, name: student.name, email: student.email }
      : undefined;

    return { id, score, feedback, submissionDate, content, assignment, student: safeStudent, isGraded };
  }

}
