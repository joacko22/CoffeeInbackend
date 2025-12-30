import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCafeteriaDto {
    @ApiProperty({ example: 'Coffee Paradise' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'The best coffee in town', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: -34.6037, required: false })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ example: -58.3816, required: false })
    @IsNumber()
    @IsOptional()
    longitude?: number;
}
