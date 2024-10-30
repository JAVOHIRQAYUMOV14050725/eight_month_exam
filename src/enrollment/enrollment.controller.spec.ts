import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt'; // JwtService import qilish
import { ConfigService } from '@nestjs/config'; // ConfigService ni import qilish

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  let service: EnrollmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        EnrollmentService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Course),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService, // JwtService ni taqdim etish
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService, // ConfigService ni taqdim etish
          useValue: {
            get: jest.fn().mockReturnValue('some_value'), // mock metod
          },
        },
      ],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
    service = module.get<EnrollmentService>(EnrollmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Qo'shimcha testlar kiritishingiz mumkin
});
