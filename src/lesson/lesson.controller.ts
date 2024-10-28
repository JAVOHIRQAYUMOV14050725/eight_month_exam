import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Req,
  Get,
  InternalServerErrorException, // Import for generic errors
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('lesson')
@UseGuards(AuthGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) { }

  @Post('create')
  async createLesson(@Body() body: CreateLessonDto, @Req() req: any) {
    const { title, contentType, content, moduleId } = body;

    if (!title || !contentType || !content || !moduleId) {
      throw new BadRequestException('All fields must be provided');
    }

    try {
      return await this.lessonService.createLesson(body, req.user);
    } catch (error) {
      throw new InternalServerErrorException('Error creating lesson', error.message);
    }
  }

  @Get(':courseId')
  async findAll(@Req() req: any, @Param('courseId') courseId: string) {
    const parsedCourseId = parseInt(courseId, 10);
    if (isNaN(parsedCourseId)) {
      throw new BadRequestException('Invalid courseId, must be an integer');
    }

    try {
      return await this.lessonService.findAll(req.user.id, parsedCourseId);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching lessons', error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any, @Param('courseId') courseId: number) {
    try {
      return await this.lessonService.findOne(+id, req.user.id, courseId);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching lesson', error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto, @Req() req: any) {
    try {
      return await this.lessonService.update(+id, updateLessonDto, req.user);
    } catch (error) {
      throw new InternalServerErrorException('Error updating lesson', error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.lessonService.remove(+id, req.user);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting lesson', error.message);
    }
  }
}
