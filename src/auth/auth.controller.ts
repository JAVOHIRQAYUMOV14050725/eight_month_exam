import { User_Role } from './../enums/user.role.enum';
import { Controller, Post, Body, UseGuards, Headers, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/user/entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Headers('authorization') authorizationHeader: string) {
    const tokens = authorizationHeader.split(' ');
    const accessToken = tokens[1];
    return this.authService.logout(accessToken);
  }

  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshToken(@Headers('authorization') authorizationHeader: string) {
    const tokens = authorizationHeader.split(' ');
    const refreshToken = tokens[2]; 
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Headers('authorization') authorizationHeader: string) {
    const tokens = authorizationHeader.split(' ');
    const accessToken = tokens[1];
    return this.authService.getMe(accessToken);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('users/all')
  @Roles(User_Role.Admin, User_Role.Teacher)
  async findAll(@Req() req: any): Promise<{ message: string, users: any[] }> {
    const userRole = req.user.role;
    const { message, teachers, students } = await this.authService.getAllUsers(userRole);

    let users: any[] = [];

    if (userRole === User_Role.Admin) {
      users = [
        {
          "mana teacherlar": teachers.map(teacher => ({
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            role: teacher.role,
            createdAt: teacher.createdAt,
          }))
        },
        {
          "mana studentlar": students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            role: student.role,
            createdAt: student.createdAt,
          }))
        }
      ];
    } else if (userRole === User_Role.Teacher) {
      users = [
        {
          "mana studentlar": students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            role: student.role,
            createdAt: student.createdAt,
          }))
        }
      ];
    }

    return { message, users }; // xabar va foydalanuvchilarni qaytarish
  }





}
