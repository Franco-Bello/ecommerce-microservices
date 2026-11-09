import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  userId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}