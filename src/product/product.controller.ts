import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.VENDOR, RoleType.ADMIN)
    @ApiOperation({ summary: 'Add a product to a cafeteria' })
    create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
        return this.productService.create(createProductDto, req.user.userId, req.user.role);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    findAll() {
        return this.productService.findAll();
    }

    @Get('cafeteria/:id')
    @ApiOperation({ summary: 'Get products by cafeteria' })
    findByCafeteria(@Param('id') id: string) {
        return this.productService.findByCafeteria(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by id' })
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.VENDOR, RoleType.ADMIN)
    @ApiOperation({ summary: 'Update a product' })
    update(@Param('id') id: string, @Body() updateProductDto: any, @Request() req: any) {
        return this.productService.update(id, updateProductDto, req.user.userId, req.user.role);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.VENDOR, RoleType.ADMIN)
    @ApiOperation({ summary: 'Delete a product' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.productService.remove(id, req.user.userId, req.user.role);
    }
}

