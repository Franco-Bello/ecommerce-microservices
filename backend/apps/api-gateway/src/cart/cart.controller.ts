import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddItemDto } from './dto/add-item.dto';

@ApiTags('Carrito y Reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Ver mi carrito actual con los productos reservados' })
  getMyCart(@CurrentUser() user: any) {
    return firstValueFrom(
      this.productsClient.send({ cmd: 'get_user_cart' }, { userId: user.id }),
    );
  }

  @Post('items')
  @ApiOperation({ summary: 'Agregar producto al carrito (Genera reserva validando stock disponible)' })
  addItem(@CurrentUser() user: any, @Body() addItemDto: AddItemDto) {
    return firstValueFrom(
      this.productsClient.send(
        { cmd: 'add_to_cart' },
        {
          userId: user.id,
          productId: addItemDto.productId,
          quantity: addItemDto.quantity,
        },
      ),
    );
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Quitar un producto de mi carrito y liberar su reserva' })
  removeItem(
    @CurrentUser() user: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return firstValueFrom(
      this.productsClient.send(
        { cmd: 'remove_from_cart' },
        { userId: user.id, productId },
      ),
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Vaciar todo mi carrito y liberar reservas' })
  clearCart(@CurrentUser() user: any) {
    return firstValueFrom(
      this.productsClient.send({ cmd: 'clear_cart' }, { userId: user.id }),
    );
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Confirmar compra: descuenta stock físico real y limpia la reserva' })
  async checkout(@CurrentUser() user: any) {
    // En el Paso 4 conectaremos aquí la llamada a INVOICES_SERVICE para emitir la factura en MongoDB
    return firstValueFrom(
      this.productsClient.send({ cmd: 'confirm_purchase' }, { userId: user.id }),
    );
  }
}