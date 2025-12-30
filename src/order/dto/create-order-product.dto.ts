import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateOrderProductDto {
    @ApiProperty({ example: 'uuid-of-product' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    quantity: number;
}
