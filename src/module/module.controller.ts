import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User_Role } from 'src/enums/user.role.enum';

@Controller('module')
@UseGuards(AuthGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) { }

  @Post()
  async create(@Body() createModuleDto: CreateModuleDto, @Req() req) {
    const user = req.user;
    if (user.role !== User_Role.Teacher) {
      throw new ForbiddenException('Only teachers can create modules');
    }
    try {
      return await this.moduleService.create(createModuleDto, user);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while creating the module');
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
  async update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto, @Req() req) {
    const user = req.user;
    if (user.role !== User_Role.Teacher) {
      throw new ForbiddenException('Only teachers can update modules');
    }
    try {
      return await this.moduleService.update(+id, updateModuleDto, user);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while updating the module');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const user = req.user;
    if (user.role !== User_Role.Teacher) {
      throw new ForbiddenException('Only teachers can delete modules');
    }
    try {
      return await this.moduleService.remove(+id, user);
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while deleting the module');
    }
  }
}
