import { Module } from '@nestjs/common';
import { InvoicesMsController } from './invoices-ms.controller';
import { InvoicesMsService } from './invoices-ms.service';

@Module({
  imports: [],
  controllers: [InvoicesMsController],
  providers: [InvoicesMsService],
})
export class InvoicesMsModule {}
