import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
  import { User } from '../user/entities/user.entity';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Admin, Repository } from 'typeorm';
  import { User_Role } from '../enums/user.role.enum';
  import * as bcrypt from 'bcrypt';
  import { JwtService } from '@nestjs/jwt';
  import { CreateUserDto } from '../user/dto/create-user.dto';

  @Injectable()
  export class AuthService {

    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly jwtService: JwtService,
    ) { }

  async register(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { name, email, password, role } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (role === User_Role.Teacher) {
      throw new ForbiddenException('Teacher registration is not allowed. Only admin can create teacher accounts.');
    }

    const adminCount = await this.userRepository.count({ where: { role: User_Role.Admin } });
    let userRole = role || User_Role.Student;
    if (userRole === User_Role.Admin && adminCount >= 1) {
      userRole = User_Role.Student;
    }

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });
    const savedUser = await this.userRepository.save(user);

    delete savedUser.password; 
    delete savedUser.refreshToken; 

    return savedUser;
  }




  async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
    

    return { accessToken, refreshToken };
  }



  async logout(accessToken: string): Promise<void> {
    try {
      // Access tokenni tekshirish va foydalanuvchi ma'lumotlarini olish
      const payload = this.jwtService.verify(accessToken);
      const user = await this.userRepository.findOne({ where: { id: payload.id } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      user.refreshToken = null; 
      await this.userRepository.save(user); 
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }





  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({ where: { refreshToken } });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken };
  }



  async getMe(accessToken: string): Promise<Partial<User>> {
    try {
      const payload = this.jwtService.verify(accessToken);
      const user = await this.userRepository.findOne({ where: { id: payload.id } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      delete user.password;
      delete user.refreshToken;

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }



  async getAllUsers(role: User_Role): Promise<{ teachers: Partial<User>[]; students: Partial<User>[]; message: string }> {
    let teachers: User[] = [];
    let students: User[] = [];
    let message: string;
    

    if (role === User_Role.Admin) {
      teachers = await this.userRepository.find({ where: { role: User_Role.Teacher } });
      students = await this.userRepository.find({ where: { role: User_Role.Student } });

      
      message = `Mana teacherlar soni: ${teachers.length}, Mana studentlar soni: ${students.length}`;
    } else if (role === User_Role.Teacher) {
      students = await this.userRepository.find({ where: { role: User_Role.Student } });
      message = `Mana studentlar soni: ${students.length}`;
    } else {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    teachers.forEach(user => {
      delete user.password;
      delete user.refreshToken;
    });

    students.forEach(user => {
      delete user.password;
      delete user.refreshToken;
    });

    return { teachers, students, message };
  }



}
