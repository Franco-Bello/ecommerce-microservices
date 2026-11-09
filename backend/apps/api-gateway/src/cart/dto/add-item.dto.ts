import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}