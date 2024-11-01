import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../guards/auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Auth } from '../auth/entities/auth.entity';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
          
        },
        {
          provide: CACHE_MANAGER, // Use CACHE_MANAGER instead of Cache
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
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
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return key === 'JWT_SECRET' ? 'secret' : null;
            }),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn(() => true), // Har doim o'tishi uchun
          },
        },
        {
          provide: getRepositoryToken(User), // UserRepository mockini qo'shing
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Qo'shimcha testlar kiritishingiz mumkin
});
