import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, Req, Patch } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { User_Role } from 'src/enums/user.role.enum';

@Controller('enrollment')
@UseGuards(AuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  @Post()
  @Roles(User_Role.Admin, User_Role.Student, User_Role.Teacher)
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Req() req: any) {
    return await this.enrollmentService.create(createEnrollmentDto, req);
  }

  @Get()
  @Roles(User_Role.Admin, User_Role.Student, User_Role.Teacher)
  async findAll(@Req() req: any) {
    return await this.enrollmentService.findAll(req);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.enrollmentService.remove(+id, req);
  }

}
