import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async promoteToVendor(userId: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'VENDOR' },
        });
        const { password, ...result } = user;
        return result;
    }

    async promoteToAdmin(userId: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
        });
        const { password, ...result } = user;
        return result;
    }

    async demoteToCustomer(userId: string) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'CUSTOMER' },
        });
        const { password, ...result } = user;
        return result;
    }

    async getAllUsers() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });
        return users;
    }

    async getDashboard() {
        const totalUsers = await this.prisma.user.count();
        const totalOrders = await this.prisma.order.count();
        const totalRevenue = await this.prisma.order.aggregate({
            _sum: { total: true },
        });
        const totalCafeterias = await this.prisma.cafeteria.count();
        const totalProducts = await this.prisma.product.count();

        return {
            totalUsers,
            totalOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            totalCafeterias,
            totalProducts,
        };
    }
}
