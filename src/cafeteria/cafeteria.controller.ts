import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CafeteriaService } from './cafeteria.service';
import { CreateCafeteriaDto } from './dto/create-cafeteria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('cafeteria')
@ApiBearerAuth()
@Controller('cafeteria')
export class CafeteriaController {
    constructor(private readonly cafeteriaService: CafeteriaService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.VENDOR, RoleType.ADMIN)
    @ApiOperation({ summary: 'Create a new cafeteria' })
    create(@Body() createCafeteriaDto: CreateCafeteriaDto, @Request() req: any) {
        return this.cafeteriaService.create(createCafeteriaDto, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all active cafeterias' })
    findAll() {
        return this.cafeteriaService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a cafeteria by id' })
    findOne(@Param('id') id: string) {
        return this.cafeteriaService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.VENDOR, RoleType.ADMIN)
    @ApiOperation({ summary: 'Update a cafeteria' })
    update(@Param('id') id: string, @Body() updateCafeteriaDto: any, @Request() req: any) {
        return this.cafeteriaService.update(id, updateCafeteriaDto, req.user.userId, req.user.role);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.VENDOR, RoleType.ADMIN)
    @ApiOperation({ summary: 'Soft delete a cafeteria' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.cafeteriaService.remove(id, req.user.userId, req.user.role);
    }
}

