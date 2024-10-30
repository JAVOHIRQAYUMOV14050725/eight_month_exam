import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Assignment } from '../assignment/entities/assignment.entity';
import { ModuleService } from '../module/module.service';
import { Modules } from '../module/entities/module.entity';

describe('ModuleService', () => {
  let service: ModuleService;

  const mockModulesRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue({ id: 1, name: 'Test Module' }), // Provide a mock return value
    remove: jest.fn().mockResolvedValue({ id: 1, name: 'Test Module' }), // Simulate removal
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
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
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


});
