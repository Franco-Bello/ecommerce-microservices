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
    @Inject('INVOICES_SERVICE') private readonly invoicesClient: ClientProxy,
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
  @ApiOperation({
    summary: 'Confirmar compra: descuenta stock en MySQL, limpia carrito y emite factura en MongoDB',
  })
  async checkout(@CurrentUser() user: any) {
    // 1. Confirmar compra en Products MS (descuenta stock físico y limpia reservas)
    const purchaseSummary = await firstValueFrom(
      this.productsClient.send({ cmd: 'confirm_purchase' }, { userId: user.id }),
    );

    // 2. Emitir factura en Invoices MS (MongoDB)
    const invoice = await firstValueFrom(
      this.invoicesClient.send(
        { cmd: 'create_invoice' },
        {
          userId: user.id,
          items: purchaseSummary.items,
          total: purchaseSummary.total,
        },
      ),
    );

    return {
      message: 'Compra confirmada y factura emitida exitosamente',
      invoice: {
        ...invoice,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    };
  }
}