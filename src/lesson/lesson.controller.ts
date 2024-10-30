import { User_Role } from './../enums/user.role.enum';
import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('lesson')
@UseGuards(AuthGuard, RolesGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) { }

  @Post('create')
  @Roles(User_Role.Teacher)
  async createLesson(
    @Body() createLessonDto: CreateLessonDto
  ) {
    return this.lessonService.create(createLessonDto);
  }

  @Get(':courseId/onCourse')
  async findAll(@Param('courseId') courseId: number, @Req() req: any) {
    const userRole = req.user.role;
    return this.lessonService.findAll(req.user.id, courseId, userRole);
  }


  @Get(':id')
  async findOne(@Param('id') id: number, @Req() req: any, @Param('courseId') courseId: number) {
    const userRole = req.user.role;
    return this.lessonService.findOne(id, req.user.id, courseId, userRole);
  }

  @Patch(':id')
  @Roles(User_Role.Teacher)   
  async updateLesson(
    @Param('id') id: number,
    @Body() updateLessonDto: UpdateLessonDto
  ) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(User_Role.Teacher)
  async deleteLesson(@Param('id') id: number) {
    return this.lessonService.remove(id);
  }
}
