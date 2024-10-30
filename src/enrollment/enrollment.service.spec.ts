import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from './enrollment.service';
import { CourseService } from '../course/course.service';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity'; // To'g'ri yo'lni tekshiring
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: getRepositoryToken(Enrollment), // Enrollment repository uchun mock
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            // Qo'shimcha metodlarni mock qilish mumkin
          },
        },
        {
          provide: getRepositoryToken(Course), // Enrollment repository uchun mock
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            // Qo'shimcha metodlarni mock qilish mumkin
          },
        },

        {
          provide: getRepositoryToken(User), // UserRepository mockini qo'shish
          useValue: {
            // Mock metodlar
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: CourseService, // CourseService uchun mock
          useValue: {
            // CourseService dan foydalanish uchun kerakli metodlar
            someMethod: jest.fn(), // O'zingizga kerakli metodlar
          },
        },
        {
          provide: UserService, // UserService uchun mock
          useValue: {
            // UserService dan foydalanish uchun kerakli metodlar
            anotherMethod: jest.fn(), // O'zingizga kerakli metodlar
          },
        },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Qo'shimcha testlar kiritishingiz mumkin
});
