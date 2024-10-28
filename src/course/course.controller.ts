import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User_Role } from 'src/enums/user.role.enum';

@Controller('course')
@UseGuards(AuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post()
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Req() req: any
  ) {
    const user = req.user;
    if (user?.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admin can create courses');
    }
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
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: any
  ) {
    const user = req.user;
    if (user?.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admin can update courses');
    }
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const user = req.user;
    if (user?.role !== User_Role.Admin) {
      throw new ForbiddenException('Only Admin can delete courses');
    }
    return this.courseService.remove(+id);
  }
}
