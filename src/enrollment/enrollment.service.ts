import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { User_Role } from '../enums/user.role.enum';

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

  async create(createEnrollmentDto: CreateEnrollmentDto, userId: string): Promise<any> {
    if (!userId) {
      throw new UnauthorizedException('User must be authenticated');
    }

    const { courseId } = createEnrollmentDto;
    if (!courseId) {
      throw new NotFoundException('Course ID must be provided.');
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      const allCourses = await this.courseRepository.find();
      if (allCourses.length === 0) {
        throw new NotFoundException('No courses available.');
      }
      return {
        message: 'Course not found. Here are the available courses:',
        courses: allCourses.map((c) => ({ id: c.id, name: c.name })),
      };
    }

    const isAlreadyEnrolled = await this.enrollmentRepository.findOne({
      where: {
        student: { id: Number(userId) },
        course: { id: courseId } 
      },
    });

    if (isAlreadyEnrolled) {
      return {
        message: 'You are already enrolled in this course',
        data: isAlreadyEnrolled,
      };
    }

    const enrollment = this.enrollmentRepository.create({
      student: { id: Number(userId) }, 
      course,
      enrolledAt: new Date(),
      userId: Number(userId), 
    });


    const savedEnrollment = await this.enrollmentRepository.save(enrollment);
    return {
      message: 'Enrollment successfully created',
      data: {
        id: savedEnrollment.id,
        course: savedEnrollment.course,
        enrolledAt: savedEnrollment.enrolledAt,
      },
    };
  }


  async findAll(req: any): Promise<any> {
    const userId = parseInt(req.user.id);
    const userRole = req.user.role; // User roli

    let enrollments;

    if (userRole === User_Role.Admin || userRole === User_Role.Teacher) {
      enrollments = await this.enrollmentRepository.find({ relations: ['course'] });
    } else {
      enrollments = await this.enrollmentRepository.find({ where: { student: { id: userId } }, relations: ['course'] });
    }

    return enrollments;
  }


  async remove(courseId: number, req: any): Promise<any> {
    const userId = parseInt(req.user.id);
    const enrollments = await this.enrollmentRepository.find({
      where: { student: { id: userId } },
      relations: ['course'],
    });

    const enrollment = enrollments.find(enrollment => enrollment.course.id === courseId);

    if (!enrollment) {
      const courseList = enrollments.map(enrollment => ({
        id: enrollment.course.id,
        name: enrollment.course.name,
      }));

      return {
        message: 'You are not enrolled in the provided course ID.',
        yourEnrollments: courseList,
      };
    }

    await this.enrollmentRepository.remove(enrollment);
    return {
      message: 'Enrollment successfully removed.',
      removedCourse: {
        id: enrollment.course.id,
        name: enrollment.course.name,
      },
    };
  }

}
