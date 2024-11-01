import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Modules } from '../module/entities/module.entity';
import { UserService } from '../user/user.service';
import { Auth } from '../auth/entities/auth.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AssignmentController', () => {
  let controller: AssignmentController;
  let service: AssignmentService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        AssignmentService,
        UserService,
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
          provide: getRepositoryToken(Modules),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
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
        UserService,
      ],
    }).compile();

    controller = module.get<AssignmentController>(AssignmentController);
    service = module.get<AssignmentService>(AssignmentService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
