import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('teacher')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return await this.userService.create(createUserDto, req.user);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    return req.user; 
  }

  @Get('getAll')
  async findAll(@Req() req: any) {
    return await this.userService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.userService.findOne(+id, req.user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return await this.userService.update(+id, updateUserDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.userService.remove(+id, req.user);
  }
}
