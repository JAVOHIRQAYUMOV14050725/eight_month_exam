import { Test, TestingModule } from '@nestjs/testing';
import { ModuleService } from './module.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { Course } from '../course/entities/course.entity';

describe('ModuleService', () => {
  let service: ModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        {
          provide: getRepositoryToken(Modules), // Mock repository for Modules entity
          useValue: {
            // Mock methods
            find: jest.fn(), // Get list of modules
            findOne: jest.fn(), // Get a single module
            save: jest.fn(), // Save a module
            remove: jest.fn(), // Remove a module
          },
        },
        {
          provide: getRepositoryToken(Course), // Mock repository for Course entity
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

  // Add more tests here as needed
});
