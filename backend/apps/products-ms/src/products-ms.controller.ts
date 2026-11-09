import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsMsService } from './products-ms.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller()
export class ProductsMsController {
  constructor(private readonly productsMsService: ProductsMsService) {}

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsMsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'find_all_products' })
  findAll() {
    return this.productsMsService.findAll();
  }

  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload() payload: { id: number }) {
    return this.productsMsService.findOne(Number(payload.id));
  }

  @MessagePattern({ cmd: 'update_product' })
  update(@Payload() payload: { id: number; data: UpdateProductDto }) {
    return this.productsMsService.update(Number(payload.id), payload.data);
  }

  @MessagePattern({ cmd: 'remove_product' })
  remove(@Payload() payload: { id: number }) {
    return this.productsMsService.remove(Number(payload.id));
  }

  @MessagePattern({ cmd: 'add_to_cart' })
  addToCart(@Payload() dto: AddToCartDto) {
    return this.productsMsService.addToCart(dto);
  }

  @MessagePattern({ cmd: 'get_user_cart' })
  getUserCart(@Payload() payload: { userId: number }) {
    return this.productsMsService.getUserCart(Number(payload.userId));
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  removeFromCart(@Payload() payload: { userId: number; productId: number }) {
    return this.productsMsService.removeFromCart(
      Number(payload.userId),
      Number(payload.productId),
    );
  }

  @MessagePattern({ cmd: 'clear_cart' })
  clearCart(@Payload() payload: { userId: number }) {
    return this.productsMsService.clearCart(Number(payload.userId));
  }

  @MessagePattern({ cmd: 'confirm_purchase' })
  confirmPurchase(@Payload() payload: { userId: number }) {
    return this.productsMsService.confirmPurchase(Number(payload.userId));
  }

  @MessagePattern({ cmd: 'clean_expired_reservations' })
  cleanExpired() {
    return this.productsMsService.cleanExpiredReservations();
  }
}