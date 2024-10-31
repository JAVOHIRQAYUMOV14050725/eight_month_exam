import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User), // Provide the mock UserRepository
          useValue: {
            findOne: jest.fn(), // Mock methods as needed
            create: jest.fn(),
            save: jest.fn(),
            // Add any other methods you may use in your service
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(), // Mock sign method
            verify: jest.fn(), // Mock verify method
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(), // Mock get method if needed
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests for AuthService methods as needed
});
