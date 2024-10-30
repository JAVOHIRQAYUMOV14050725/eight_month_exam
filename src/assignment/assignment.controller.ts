import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Patch, BadRequestException } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { User_Role } from 'src/enums/user.role.enum';

@Controller('modules')
@UseGuards(AuthGuard, RolesGuard)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) { }

  @Post(':moduleId/assignment')
  @Roles(User_Role.Teacher)
  async createAssignment(
    @Param('moduleId') moduleId: string,
    @Body() createAssignmentDto: CreateAssignmentDto
  ) {
    const id = parseInt(moduleId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid module ID');
    }

    return this.assignmentService.create(id, createAssignmentDto);
  }

  @Get(':moduleId/assignments')
  async findAll(@Param('moduleId') moduleId: string) {  
    const id = parseInt(moduleId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid module ID');
    }
    return this.assignmentService.findAll(id);
  }



  @Get('assignment/:id')
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid assignment ID');
    }
    return this.assignmentService.findOne(parsedId);
  }

  @Patch('assignment/:id')
  @Roles(User_Role.Teacher)
  async updateAssignment(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid assignment ID');
    }
    return this.assignmentService.update(parsedId, updateAssignmentDto);
  }

  @Delete('assignment/:id')
  @Roles(User_Role.Teacher)
  async deleteAssignment(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid assignment ID');
    }
    return this.assignmentService.remove(parsedId);
  }
}
