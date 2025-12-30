import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'Espresso' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Strong and bold', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 3.5 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 100 })
    @IsInt()
    @Min(0)
    stock: number;

    @ApiProperty({ example: 'uuid-of-cafeteria' })
    @IsString()
    @IsNotEmpty()
    cafeteriaId: string;
}
