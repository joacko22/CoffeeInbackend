import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderProductDto } from './create-order-product.dto';

export class CreateOrderDto {
    @ApiProperty({ type: [CreateOrderProductDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderProductDto)
    products: CreateOrderProductDto[];
}
