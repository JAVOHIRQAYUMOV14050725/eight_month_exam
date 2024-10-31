import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, Req, Patch, UnauthorizedException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { User_Role } from '../enums/user.role.enum';

@Controller('enrollment')
@UseGuards(AuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }
  @Post()
  @Roles(User_Role.Admin, User_Role.Student, User_Role.Teacher)
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Req() req: any) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User is not authenticated');
    }
    return await this.enrollmentService.create(createEnrollmentDto, req.user.id);
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
