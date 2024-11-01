import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubmissionService } from './submission.service';
import { Submission } from './entities/submission.entity';
import { Assignment } from '../assignment/entities/assignment.entity';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager'; // Import CacheModule
import { Modules } from '../module/entities/module.entity';

describe('SubmissionService', () => {
  let service: SubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // Add CacheModule here
      providers: [
        SubmissionService,
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
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
