import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { User_Role } from 'src/enums/user.role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }



  async create(createUserDto: CreateUserDto, user: any) {
    if (user.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admin can create other Teachers');
    }

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
  }

  async update(id: number, updateUserDto: UpdateUserDto, user: any) {
    if (user.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admin can update other Teachers');
    }

    const existingUser = await this.userRepository.findOne({ where: { id } });
    const existingTeachers = await this.userRepository.find({ where: { role: User_Role.Teacher } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found. Existing Teacher IDs: ${existingTeachers.map(user => user.id).join(', ')}`);
    }

    if (existingUser.role !== User_Role.Teacher) {
      throw new NotFoundException(`User with ID ${id} is not a Teacher. Existing Teacher IDs: ${existingTeachers.map(user => user.id).join(', ')}`);
    }

    if (updateUserDto.email) {
      const existingEmailUser = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
      if (existingEmailUser && existingEmailUser.id !== id) {
        throw new ConflictException(`Email ${updateUserDto.email} is already in use by another user.`);
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUserData = {
      ...existingUser, 
      ...updateUserDto,
    };

    await this.userRepository.update(id, updatedUserData); 
    return { ...updatedUserData, refreshToken: undefined };
  }




  async findAll(user: any) {
    if (user.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admin can access this resource');
    }

    const users = await this.userRepository.find({ where: { role: User_Role.Teacher } });
    return users.map(user => ({ ...user, refreshToken: undefined, password: undefined }));
  }

  async findOne(id: number, user: any) {
    if (user.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admins can access this resource');
    }

    const foundUser = await this.userRepository.findOne({ where: { id } });
    const existingTeachers = await this.userRepository.find({ where: { role: User_Role.Teacher } });

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${id} not found. Existing Teacher IDs: ${existingTeachers.map(user => user.id).join(', ')}`);
    }

    if (foundUser.role !== User_Role.Teacher) {
      throw new NotFoundException(`User with ID ${id} is not a Teacher. Existing Teacher IDs: ${existingTeachers.map(user => user.id).join(', ')}`);
    }

    const { password, refreshToken, ...userWithoutPassword } = foundUser;
    return userWithoutPassword;
  }



  async remove(id: number, user: any) {
    if (user.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admin can delete other Teachers');
    }

    const existingUser = await this.userRepository.findOne({ where: { id } });
    const existingTeachers = await this.userRepository.find({ where: { role: User_Role.Teacher } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found. Existing Teacher IDs: ${existingTeachers.map(user => user.id).join(', ')}`);
    }

    if (existingUser.role !== User_Role.Teacher) {
      throw new NotFoundException(`User with ID ${id} is not a Teacher. Existing Teacher IDs: ${existingTeachers.map(user => user.id).join(', ')}`);
    }

    const deleteResult = await this.userRepository.delete(id);
    if (!deleteResult.affected) {
      throw new NotFoundException(`User with ID ${id} could not be deleted`);
    }

    return `This action removes a user with ID #${id}`;
  }
}
