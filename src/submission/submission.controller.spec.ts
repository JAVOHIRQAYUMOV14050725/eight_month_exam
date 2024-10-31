import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm'; // getRepositoryToken import qilish
import { Submission } from './entities/submission.entity'; // Submission entity import qilish
import { Assignment } from 'src/assignment/entities/assignment.entity';

describe('SubmissionController', () => {
  let controller: SubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        SubmissionService,
        {
          provide: getRepositoryToken(Submission), // SubmissionRepository ni taqdim etish
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Assignment), // SubmissionRepository ni taqdim etish
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
            get: jest.fn((key: string) => {
              return key === 'JWT_SECRET' ? 'secret' : null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Qo'shimcha testlar kiritishingiz mumkin
});
