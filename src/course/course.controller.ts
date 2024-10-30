import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User_Role } from '../enums/user.role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';


@Controller('course')
export class CourseController {



  constructor(private readonly courseService: CourseService) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(User_Role.Admin)
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAllWithAuth(@Req() req: any) {
    return this.courseService.findAll(true);  
  }

  @Get('public')
  async findAllPublic() {
    return this.courseService.findAll(false); 
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOneWithAuth(@Param('id') id: string) {
    return this.courseService.findOne(+id, true);
  }

  @Get(':id/public')
  async findOnePublic(@Param('id') id: string) {
    return await this.courseService.findOne(+id, false); 
  }


  @Get(':courseId/modules')
  @UseGuards(AuthGuard)
  async findModulesWithAuth(@Param('courseId') courseId: string) {
    return this.courseService.findModulesByCourseId(+courseId, true);
  }

  @Get(':courseId/modules/public')
  async findModulesPublic(@Param('courseId') courseId: string) {
    return this.courseService.findModulesByCourseId(+courseId, false);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(User_Role.Admin)
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto, true);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(User_Role.Admin)
  async remove(@Param('id') id: string) {
    return this.courseService.remove(+id, true);
  }
}