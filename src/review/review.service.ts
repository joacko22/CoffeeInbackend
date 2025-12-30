import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }

    async create(createReviewDto: CreateReviewDto, userId: string) {
        const cafeteria = await this.prisma.cafeteria.findUnique({
            where: { id: createReviewDto.cafeteriaId },
        });

        if (!cafeteria) throw new NotFoundException('Cafeteria not found');

        return this.prisma.review.create({
            data: {
                ...createReviewDto,
                userId,
            },
        });
    }

    async findAllByCafeteria(cafeteriaId: string) {
        return this.prisma.review.findMany({
            where: { cafeteriaId },
            include: { user: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    async remove(id: string, userId: string, role: string) {
        const review = await this.findOne(id);

        if (role !== RoleType.ADMIN && review.userId !== userId) {
            throw new ForbiddenException('Not authorized to delete this review');
        }

        return this.prisma.review.delete({
            where: { id },
        });
    }

    async getAverageRating(cafeteriaId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { cafeteriaId },
        });

        if (reviews.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }

        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return {
            averageRating: total / reviews.length,
            totalReviews: reviews.length,
        };
    }
}
