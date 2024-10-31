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
          provide: getRepositoryToken(Modules), // Module entitysi uchun mock repository
          useValue: {
            // Mock metodlar
            find: jest.fn(), // Modullar ro'yxatini olish
            findOne: jest.fn(), // Bitta modulni olish
            save: jest.fn(), // Modulni saqlash
            remove: jest.fn(), // Modulni o'chirish
            // Qo'shimcha metodlarni mock qilish
          },
        },
        // Agar ModuleService boshqa repository yoki servislardan foydalanayotgan bo'lsa, ularni ham mock qilishingiz kerak:
        {
          provide: getRepositoryToken(Course), // Agar CourseRepository kerak bo'lsa
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
});
