import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('review')
@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a review for a cafeteria' })
    create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
        return this.reviewService.create(createReviewDto, req.user.userId);
    }

    @Get('cafeteria/:id')
    @ApiOperation({ summary: 'Get all reviews for a cafeteria' })
    findAllByCafeteria(@Param('id') id: string) {
        return this.reviewService.findAllByCafeteria(id);
    }

    @Get('cafeteria/:id/average')
    @ApiOperation({ summary: 'Get average rating for a cafeteria' })
    getAverageRating(@Param('id') id: string) {
        return this.reviewService.getAverageRating(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a review' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.reviewService.remove(id, req.user.userId, req.user.role);
    }
}
