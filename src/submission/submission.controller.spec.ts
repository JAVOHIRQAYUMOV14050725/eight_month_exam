import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignment/entities/assignment.entity';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Auth } from '../auth/entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

describe('SubmissionController', () => {
  let controller: SubmissionController;
  let userService: UserService;
  let submissionService: SubmissionService; // SubmissionService olingan

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // CacheModule ni kiritish
      controllers: [SubmissionController],
      providers: [
        SubmissionService,
        UserService,
        {
          provide: getRepositoryToken(Submission),
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
          provide: getRepositoryToken(Auth),
          useValue: {
            find: jest.fn(),
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
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return key === 'JWT_SECRET' ? 'secret' : null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
    submissionService = module.get<SubmissionService>(SubmissionService); 
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
