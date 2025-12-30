import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto, userId: string, role: string) {
        const cafeteria = await this.prisma.cafeteria.findUnique({
            where: { id: createProductDto.cafeteriaId },
        });

        if (!cafeteria) throw new NotFoundException('Cafeteria not found');
        if (role !== RoleType.ADMIN && cafeteria.ownerId !== userId) {
            throw new ForbiddenException('Not authorized to add products to this cafeteria');
        }

        return this.prisma.product.create({
            data: createProductDto,
        });
    }

    async findAll() {
        return this.prisma.product.findMany();
    }

    async findByCafeteria(cafeteriaId: string) {
        return this.prisma.product.findMany({
            where: { cafeteriaId },
        });
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: string, updateProductDto: any, userId: string, role: string) {
        const product = await this.findOne(id);
        const cafeteria = await this.prisma.cafeteria.findUnique({
            where: { id: product.cafeteriaId },
        });

        if (!cafeteria) throw new NotFoundException('Cafeteria not found');
        if (role !== RoleType.ADMIN && cafeteria.ownerId !== userId) {
            throw new ForbiddenException('Not authorized to update this product');
        }

        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
        });
    }

    async remove(id: string, userId: string, role: string) {
        const product = await this.findOne(id);
        const cafeteria = await this.prisma.cafeteria.findUnique({
            where: { id: product.cafeteriaId },
        });

        if (!cafeteria) throw new NotFoundException('Cafeteria not found');
        if (role !== RoleType.ADMIN && cafeteria.ownerId !== userId) {
            throw new ForbiddenException('Not authorized to delete this product');
        }

        return this.prisma.product.delete({
            where: { id },
        });
    }
}

