import {
  Injectable,
  ConflictException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { User_Role } from '../enums/user.role.enum';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Auth } from '../auth/entities/auth.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>, 
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }


  private async findTeachers() {
    return await this.userRepository.find({
      where: { role: User_Role.Teacher },
      select: ['id', 'name'],
    });
  }

 

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(
          `User with email ${createUserDto.email} already exists.`,
        );
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(newUser);
      delete savedUser.refreshToken;
      delete savedUser.password;

      await this.cacheManager.del('all_teachers');
      return savedUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      // Foydalanuvchini qidirish
      const existingUser = await this.userRepository.findOne({
        where: { id, role: User_Role.Teacher },
      });

      // Agar foydalanuvchi topilmasa
      if (!existingUser) {
        const allTeachers = await this.findTeachers();
        const teacherInfo = allTeachers.length
          ? `Available Teachers: ${allTeachers
            .map(teacher => `{ Name: ${teacher.name}, ID: ${teacher.id} }`)
            .join(', ')}`
          : 'No Teacher users found.';

        throw new NotFoundException(`Teacher with ID ${id} not found. ${teacherInfo}`);
      }

      // Foydalanuvchini yangilash
      await this.userRepository.update(id, updateUserDto);

      // Keshni tozalash
      await Promise.all([
        this.cacheManager.del('all_teachers'),
        this.cacheManager.del(`teacher_${id}`),
      ]);

      return {
        message: `User with ID #${id} updated successfully.`,
        updatedUser: { id, ...updateUserDto },
      };
    } catch (error) {
      // Xatoliklarni boshqarish
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOneUser(id: number): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }


  async findAll() {
    try {
      const cachedUsers = await this.cacheManager.get<User[]>('all_teachers');
      if (cachedUsers) return cachedUsers;

      const users = await this.userRepository.find({
        where: { role: User_Role.Teacher },
      });
      const sanitizedUsers = users.map(user => ({
        ...user,
        refreshToken: undefined,
        password: undefined,
      }));

      await this.cacheManager.set('all_teachers', sanitizedUsers,3600);
      return sanitizedUsers;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const cachedUser = await this.cacheManager.get<User>(`teacher_${id}`);
      if (cachedUser) return cachedUser;

      const foundUser = await this.userRepository.findOne({
        where: { id, role: User_Role.Teacher },
      });
      if (!foundUser) {
        const allTeachers = await this.findTeachers();
        const teacherInfo = allTeachers.length
          ? `Available Teachers: ${allTeachers
            .map(teacher => `{ Name: ${teacher.name}, ID: ${teacher.id} }`)
            .join(', ')}`
          : 'No Teacher users found.';

        throw new NotFoundException(`Teacher with ID ${id} not found. ${teacherInfo}`);
      }

      const { password, refreshToken, ...userWithoutSensitiveData } = foundUser;
      await this.cacheManager.set(`teacher_${id}`, userWithoutSensitiveData, 3600);
      return userWithoutSensitiveData;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { id, role: User_Role.Teacher },
      });

      if (!existingUser) {
        const allTeachers = await this.findTeachers();
        const teacherInfo = allTeachers.length
          ? `Available Teachers: ${allTeachers
            .map(teacher => `{ Name: ${teacher.name}, ID: ${teacher.id} }`)
            .join(', ')}`
          : 'No Teacher users found.';

        throw new NotFoundException(`Teacher with ID ${id} not found. ${teacherInfo}`);
      }

      await this.userRepository.delete(id);

      await Promise.all([
        this.cacheManager.del('all_teachers'),
        this.cacheManager.del(`teacher_${id}`),
      ]);

      return { message: `User with ID #${id} has been removed.` };
    } catch (error) {
      throw new HttpException(error.message || 'An error occurred while deleting the user.', HttpStatus.BAD_REQUEST);
    }
  }



}
