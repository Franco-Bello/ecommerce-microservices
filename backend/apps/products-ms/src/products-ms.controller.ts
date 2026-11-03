import { Controller, Get } from '@nestjs/common';
import { ProductsMsService } from './products-ms.service';

@Controller()
export class ProductsMsController {
  constructor(private readonly productsMsService: ProductsMsService) {}

  @Get()
  getHello(): string {
    return this.productsMsService.getHello();
  }
}
