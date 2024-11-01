import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm'; // getRepositoryToken import qilish
import { Submission } from './entities/submission.entity'; // Submission entity import qilish
import { Assignment } from '../assignment/entities/assignment.entity';
import { Modules } from '../module/entities/module.entity';
import { User } from '../user/entities/user.entity';

describe('SubmissionController', () => {
  let controller: SubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
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
          provide: getRepositoryToken(Assignment),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: Cache,
          useValue: {} // Mocked Cache
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
            get: jest.fn((key: string) => {
              return key === 'JWT_SECRET' ? 'secret' : null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
  });
})