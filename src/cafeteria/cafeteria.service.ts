import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCafeteriaDto } from './dto/create-cafeteria.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class CafeteriaService {
    constructor(private prisma: PrismaService) { }

    async create(createCafeteriaDto: CreateCafeteriaDto, ownerId: string) {
        return this.prisma.cafeteria.create({
            data: {
                ...createCafeteriaDto,
                ownerId,
            },
        });
    }

    async findAll() {
        return this.prisma.cafeteria.findMany({
            where: { isActive: true },
            include: { products: true },
        });
    }

    async findAllAdmin() {
        return this.prisma.cafeteria.findMany({
            include: { products: true, owner: true },
        });
    }

    async findMyCafeterias(ownerId: string) {
        return this.prisma.cafeteria.findMany({
            where: { ownerId, isActive: true },
            include: { products: true },
        });
    }

    async findOne(id: string) {
        const cafeteria = await this.prisma.cafeteria.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!cafeteria) throw new NotFoundException('Cafeteria not found');
        return cafeteria;
    }

    async update(id: string, updateCafeteriaDto: any, userId: string, role: string) {
        const cafeteria = await this.findOne(id);
        if (role !== RoleType.ADMIN && cafeteria.ownerId !== userId) {
            throw new ForbiddenException('Not authorized to update this cafeteria');
        }
        return this.prisma.cafeteria.update({
            where: { id },
            data: updateCafeteriaDto,
        });
    }

    async remove(id: string, userId: string, role: string) {
        const cafeteria = await this.findOne(id);
        if (role !== RoleType.ADMIN && cafeteria.ownerId !== userId) {
            throw new ForbiddenException('Not authorized to delete this cafeteria');
        }
        return this.prisma.cafeteria.update({
            where: { id },
            data: { isActive: false },
        });
    }
}

