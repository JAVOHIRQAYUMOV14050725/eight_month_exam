import { Controller, Post, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { User_Role } from '../enums/user.role.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(User_Role.Student)
  async createSubmission(@Body() createSubmissionDto: CreateSubmissionDto, @Req() req: any) {
    return this.submissionService.create(createSubmissionDto, req.user);
  }

 


  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(User_Role.Teacher, User_Role.Student)
  async updateSubmission(
    @Param('id') id: number,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Req() req: any
  ) {
    const userRole = req.user.role;
    if (userRole === User_Role.Teacher) {
      return this.submissionService.update(id, updateSubmissionDto, req.user);
    } else {
      return this.submissionService.update(id, {
        assignmentId: updateSubmissionDto.assignmentId,
        content: updateSubmissionDto.content,
        score: null,
        feedback: null
      }, req.user);
    }
  }


  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(User_Role.Teacher, User_Role.Student,User_Role.Admin)
  async getSubmissions(@Req() req: any) {
    return this.submissionService.findAll(req.user);
  }


}
