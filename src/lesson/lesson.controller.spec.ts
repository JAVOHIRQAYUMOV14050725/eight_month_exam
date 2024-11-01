import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from '../assignment/entities/assignment.entity';
import { Modules } from '../module/entities/module.entity';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { Lesson } from './entities/lesson.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Course } from '../course/entities/course.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Auth } from '../auth/entities/auth.entity';

describe('LessonController', () => {
  let controller: LessonController;
  let userService: UserService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        LessonService,
        UserService,
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
          provide: getRepositoryToken(Assignment),
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
            save: jest.fn(),
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
          provide: getRepositoryToken(Modules),
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
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => (key === 'JWT_SECRET' ? 'secret' : null)),
          },
        },
      ],
    }).compile();

    controller = module.get<LessonController>(LessonController);
    userService = module.get<UserService>(UserService)

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
