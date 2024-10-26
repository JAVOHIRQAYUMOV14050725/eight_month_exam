import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { User_Role } from 'src/enums/user.role.enum';

@Controller('course')
@UseGuards(AuthGuard) 
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post()
  @UseGuards(RolesGuard) 
  @SetMetadata('roles', [User_Role.Admin])
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard) 
  @SetMetadata('roles', [User_Role.Admin])
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) 
  @SetMetadata('roles', [User_Role.Admin])
  async remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
