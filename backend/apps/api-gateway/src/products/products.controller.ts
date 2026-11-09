import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos con su stock físico y disponible' })
  findAll() {
    return firstValueFrom(
      this.productsClient.send({ cmd: 'find_all_products' }, {}),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un producto por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.productsClient.send({ cmd: 'find_one_product' }, { id }),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo producto (Solo ADMIN)' })
  create(@Body() createProductDto: CreateProductDto) {
    return firstValueFrom(
      this.productsClient.send({ cmd: 'create_product' }, createProductDto),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar precio, nombre o stock de un producto (Solo ADMIN)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return firstValueFrom(
      this.productsClient.send(
        { cmd: 'update_product' },
        { id, data: updateProductDto },
      ),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar (baja lógica) un producto (Solo ADMIN)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.productsClient.send({ cmd: 'remove_product' }, { id }),
    );
  }
}