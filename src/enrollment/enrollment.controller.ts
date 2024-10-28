import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('enrollment')
@UseGuards(AuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  @Post()
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Req() req: any) {
    return await this.enrollmentService.create(createEnrollmentDto, req);
  }

  @Get()
  async findAll(@Req() req: any) { 
    return await this.enrollmentService.findAll(req);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) { 
    return await this.enrollmentService.findOne(+id, req);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const studentId = req.user.id;
    return await this.enrollmentService.remove(+id, studentId);
  }
}
