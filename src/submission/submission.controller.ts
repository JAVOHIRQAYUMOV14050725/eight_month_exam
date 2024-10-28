import { Controller, Post, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { User_Role } from 'src/enums/user.role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('submissions')
@UseGuards(AuthGuard, RolesGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) { }

  @Post()
  @Roles('student')
  async createSubmission(@Body() createSubmissionDto: CreateSubmissionDto, @Req() req: any) {
    return this.submissionService.create(createSubmissionDto, req.user);
  }

  @Get(':assignmentId')
  async findAllByAssignment(@Param('assignmentId') assignmentId: number, @Req() req: any) {
    return this.submissionService.findAllByAssignment(assignmentId, req.user);
  }

  @Get('submission/:id')
  async findOneById(@Param('id') id: number, @Req() req: any) {
    return this.submissionService.findOneById(id, req.user);
  }



  @Get('student/:studentId')
  async findAllByStudent(@Param('studentId') studentId: number, @Req() req: any) {
    return this.submissionService.findAllByStudent(studentId);
  }

  @Patch(':id')
  async updateSubmission(
    @Param('id') id: number,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Req() req: any
  ) {
    if (req.user.role === User_Role.Teacher) {
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
}
