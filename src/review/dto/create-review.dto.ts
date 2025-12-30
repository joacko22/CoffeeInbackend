import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ example: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ example: 'Excellent coffee and atmosphere!' })
    @IsString()
    @IsNotEmpty()
    comment: string;

    @ApiProperty({ example: 'uuid-of-cafeteria' })
    @IsString()
    @IsNotEmpty()
    cafeteriaId: string;
}
