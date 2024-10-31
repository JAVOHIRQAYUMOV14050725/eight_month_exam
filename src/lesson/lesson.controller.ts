import { User_Role } from './../enums/user.role.enum';
import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

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



  @Get(':courseId/:id')
  async findOne(
    @Param('id') id: string,
    @Param('courseId') courseId: string, 
    @Req() req: any
  ) {
    const userRole = req.user.role;
    return this.lessonService.findOne(Number(id), req.user.id, Number(courseId), userRole); 
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
