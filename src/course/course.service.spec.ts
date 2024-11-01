import { UserService } from '../user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Assignment } from '../assignment/entities/assignment.entity';
import { ModuleService } from '../module/module.service';
import { Modules } from '../module/entities/module.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from '../user/entities/user.entity';
import { CourseService } from './course.service';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Auth } from '../auth/entities/auth.entity';

describe('CourseService', () => {
  let courseService: CourseService;
  let userService: UserService;

  const mockModulesRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue({ id: 1, name: 'Test Module' }),
    remove: jest.fn().mockResolvedValue({ id: 1, name: 'Test Module' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        UserService,
        {
          provide: getRepositoryToken(Modules),
          useValue: mockModulesRepository,
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
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Lesson),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
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
          provide: getRepositoryToken(Auth),
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
          provide: getRepositoryToken(Modules),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Assignment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    userService = module.get<UserService>(UserService)
  });

  it('should be defined', () => {
    expect(courseService).toBeDefined();
  });


});
