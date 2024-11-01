import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from './enrollment.service';
import { CourseService } from '../course/course.service';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Course), 
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },

        {
          provide: getRepositoryToken(User),
          useValue: {
            // Mock metodlar
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: CourseService,
          useValue: {
            someMethod: jest.fn(), 
          },
        },
        {
          provide: UserService, 
          useValue: {
            anotherMethod: jest.fn(), 
          },
        },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
