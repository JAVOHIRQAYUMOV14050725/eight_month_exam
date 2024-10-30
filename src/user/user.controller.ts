import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { User_Role } from '../enums/user.role.enum';

@Controller('teacher')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('create')
  @Roles(User_Role.Admin)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('getAll')
  @Roles(User_Role.Admin)
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @Roles(User_Role.Admin)
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(+id);
  }

  @Patch(':id')
  @Roles(User_Role.Admin)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(User_Role.Admin)
  async remove(@Param('id') id: string) {
    return await this.userService.remove(+id);
  }
}
