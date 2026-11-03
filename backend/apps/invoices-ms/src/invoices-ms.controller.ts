import { Controller, Get } from '@nestjs/common';
import { InvoicesMsService } from './invoices-ms.service';

@Controller()
export class InvoicesMsController {
  constructor(private readonly invoicesMsService: InvoicesMsService) {}

  @Get()
  getHello(): string {
    return this.invoicesMsService.getHello();
  }
}
