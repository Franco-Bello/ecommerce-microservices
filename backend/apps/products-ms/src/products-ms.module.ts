import { Module } from '@nestjs/common';
import { ProductsMsController } from './products-ms.controller';
import { ProductsMsService } from './products-ms.service';

@Module({
  imports: [],
  controllers: [ProductsMsController],
  providers: [ProductsMsService],
})
export class ProductsMsModule {}
