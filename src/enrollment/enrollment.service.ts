import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { User_Role } from 'src/enums/user.role.enum';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createEnrollmentDto: CreateEnrollmentDto, req: any) {
    const userId = req.user.id;
    const { courseId } = createEnrollmentDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || ![User_Role.Student, User_Role.Teacher, User_Role.Admin].includes(user.role)) {
      throw new ForbiddenException(
        'You must be a student, teacher, or admin to enroll in a course',
      );
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const isAlreadyEnrolled = await this.enrollmentRepository.findOne({
      where: { student: { id: userId }, course: { id: courseId } },
    });

    if (isAlreadyEnrolled) {
      return { message: 'You are already enrolled in this course', data: isAlreadyEnrolled };
    }

    // Ro'yxatdan o'tish
    const enrollment = this.enrollmentRepository.create({
      student: user,
      course,
      enrolledAt: new Date(),
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(req: any) {
    const userId = req.user.id;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user.role === User_Role.Admin) {
      const enrollments = await this.enrollmentRepository.find({ relations: ['student', 'course'] });

      return enrollments.map(enrollment => {
        const { password, refreshToken, ...studentWithoutSensitiveData } = enrollment.student;
        return {
          ...enrollment,
          student: studentWithoutSensitiveData,
        };
      });
    } else if (user.role === User_Role.Student) {
      const enrollments = await this.enrollmentRepository.find({
        where: { student: { id: userId } },
        relations: ['course'],
      });

      return enrollments.map(enrollment => ({
        ...enrollment,
        student: { id: userId },
      }));
    } else {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
  }

  async findOne(id: number, req: any) {
    const userId = req.user.id;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.role !== User_Role.Admin) {
      throw new ForbiddenException('Only admin can access this resource');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    const { password, refreshToken, ...studentWithoutSensitiveData } = enrollment.student;

    return {
      ...enrollment,
      student: studentWithoutSensitiveData,
    };
  }

  async remove(id: number, studentId: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id, student: { id: studentId } },
      relations: ['student', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment not found or you are not enrolled`);
    }

    return await this.enrollmentRepository.remove(enrollment);
  }
}
