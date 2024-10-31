import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Mock classes for your repositories
const mockLessonRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  // Add other methods you plan to mock
};

const mockEnrollmentRepository = {
  find: jest.fn(),
  // Add other methods you plan to mock
};

const mockModulesRepository = {
  find: jest.fn(),
  // Add other methods you plan to mock
};

describe('LessonController', () => {
  let controller: LessonController;
  let service: LessonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        LessonService,
        {
          provide: 'LessonRepository',
          useValue: mockLessonRepository,
        },
        {
          provide: 'EnrollmentRepository',
          useValue: mockEnrollmentRepository,
        },
        {
          provide: 'ModulesRepository',
          useValue: mockModulesRepository,
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
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LessonController>(LessonController);
    service = module.get<LessonService>(LessonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests for controller methods as needed
});
