import { Injectable, ConflictException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { User_Role } from 'src/enums/user.role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  private async findTeachers() {
    const teachers = await this.userRepository.find({
      where: { role: User_Role.Teacher },
      select: ['id', 'name'],
    });
    return teachers;
  }


  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
      if (existingUser) {
        throw new ConflictException(`User with email ${createUserDto.email} already exists.`);
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      newUser.refreshToken = undefined;
      const savedUser = await this.userRepository.save(newUser);
      delete savedUser.refreshToken;
      delete savedUser.password;
      return savedUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id, role: User_Role.Teacher } });
      if (!existingUser) {
        const allTeachers = await this.findTeachers();
        const teacherInfo = allTeachers.length
          ? allTeachers.map(teacher => teacher.name ? `{ Name: ${teacher.name}, ID: ${teacher.id} }` : `{ ID: ${teacher.id} }`).join(', ')
          : 'No Teacher users found.';

        throw new NotFoundException(`User with ID ${id} not found. Available Teachers: ${teacherInfo}`);
      }
      // Qolgan update logikasi
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find({ where: { role: User_Role.Teacher } });
      return users.map(user => ({ ...user, refreshToken: undefined, password: undefined }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const foundUser = await this.userRepository.findOne({ where: { id, role: User_Role.Teacher } });
      if (!foundUser) {
        const allTeachers = await this.findTeachers();
        const teacherInfo = allTeachers.length
          ? allTeachers.map(teacher => teacher.name ? `{ Name: ${teacher.name}, ID: ${teacher.id} }` : `{ ID: ${teacher.id} }`).join(', ')
          : 'No Teacher users found.';

        throw new NotFoundException(`User with ID ${id} not found. Available Teachers: ${teacherInfo}`);
      }
      const { password, refreshToken, ...userWithoutSensitiveData } = foundUser;
      return userWithoutSensitiveData;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id, role: User_Role.Teacher } });
      if (!existingUser) {
        const allTeachers = await this.findTeachers();
        const teacherInfo = allTeachers.length
          ? allTeachers.map(teacher => teacher.name ? `{ Name: ${teacher.name}, ID: ${teacher.id} }` : `{ ID: ${teacher.id} }`).join(', ')
          : 'No Teacher users found.';

        throw new NotFoundException(`User with ID ${id} not found. Available Teachers: ${teacherInfo}`);
      }

      await this.userRepository.delete(id);
      return `User with ID #${id} has been removed.`;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
