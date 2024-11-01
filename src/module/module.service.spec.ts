import { Test, TestingModule } from '@nestjs/testing';
import { ModuleService } from './module.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Modules } from './entities/module.entity';
import { Course } from '../course/entities/course.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserService } from '../user/user.service'; // UserService import qilingan

describe('ModuleService', () => {
  let service: ModuleService;
  let userService: UserService; 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        UserService,
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
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
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
          provide: UserService, 
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
    userService = module.get<UserService>(UserService); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
