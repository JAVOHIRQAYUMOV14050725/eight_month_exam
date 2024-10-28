import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { User_Role } from 'src/enums/user.role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('module')
@UseGuards(AuthGuard, RolesGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) { }

  @Post()
  @Roles('teacher')
  async create(@Body() createModuleDto: CreateModuleDto, @Req() req) {
    try {
      return await this.moduleService.create(createModuleDto, req.user);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while creating the module');
    }
  }

  @Get(':moduleId/lessons')
  async findLessons(@Param('moduleId') moduleId: string) {
    try {
      return await this.moduleService.findLessonsByModuleId(+moduleId);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching lessons');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.moduleService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching modules');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.moduleService.findOne(+id);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching the module');
    }
  }

  @Patch(':id')
  @Roles('teacher')
  async update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto, @Req() req) {
    try {
      return await this.moduleService.update(+id, updateModuleDto, req.user);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while updating the module');
    }
  }

  @Delete(':id')
  @Roles('teacher')
  async remove(@Param('id') id: string, @Req() req) {
    try {
      return await this.moduleService.remove(+id, req.user);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while deleting the module');
    }
  }
}
