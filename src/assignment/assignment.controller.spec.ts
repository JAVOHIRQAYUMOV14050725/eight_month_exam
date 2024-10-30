import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Modules } from '../module/entities/module.entity';

describe('AssignmentController', () => {
  let controller: AssignmentController;
  let service: AssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        AssignmentService,
        {
          provide: getRepositoryToken(Assignment), // Mock for Assignment repository
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Modules), // Mock for Modules repository
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User), // Mock for User repository
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService, // Mock for JwtService
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService, // Mock for ConfigService
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AssignmentController>(AssignmentController);
    service = module.get<AssignmentService>(AssignmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // Add more tests here
});
