import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new order' })
    create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
        return this.orderService.create(createOrderDto, req.user.userId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Get all orders based on user role' })
    findAll(@Request() req: any) {
        return this.orderService.findAll(req.user.userId, req.user.role);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Get an order by id' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.orderService.findOne(id, req.user.userId, req.user.role);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.VENDOR, RoleType.ADMIN)
    @ApiOperation({ summary: 'Update order status' })
    updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
        return this.orderService.updateStatus(id, status, req.user.userId, req.user.role);
    }
}

