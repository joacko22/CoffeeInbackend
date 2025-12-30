import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get high-level business metrics' })
    getDashboard() {
        return this.adminService.getDashboard();
    }

    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Patch('user/:id/promote-vendor')
    @ApiOperation({ summary: 'Promote user to VENDOR role' })
    promoteToVendor(@Param('id') id: string) {
        return this.adminService.promoteToVendor(id);
    }

    @Patch('user/:id/promote-admin')
    @ApiOperation({ summary: 'Promote user to ADMIN role' })
    promoteToAdmin(@Param('id') id: string) {
        return this.adminService.promoteToAdmin(id);
    }

    @Patch('user/:id/demote-customer')
    @ApiOperation({ summary: 'Demote user to CUSTOMER role' })
    demoteToCustomer(@Param('id') id: string) {
        return this.adminService.demoteToCustomer(id);
    }
}
