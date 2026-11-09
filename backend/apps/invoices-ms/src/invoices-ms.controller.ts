import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InvoicesMsService } from './invoices-ms.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller()
export class InvoicesMsController {
  constructor(private readonly invoicesMsService: InvoicesMsService) {}

  @MessagePattern({ cmd: 'create_invoice' })
  create(@Payload() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesMsService.create(createInvoiceDto);
  }

  @MessagePattern({ cmd: 'find_all_invoices' })
  findAll() {
    return this.invoicesMsService.findAll();
  }

  @MessagePattern({ cmd: 'find_user_invoices' })
  findByUser(@Payload() payload: { userId: number }) {
    return this.invoicesMsService.findByUser(Number(payload.userId));
  }

  @MessagePattern({ cmd: 'find_one_invoice' })
  findOne(@Payload() payload: { id: string }) {
    return this.invoicesMsService.findOne(payload.id);
  }
}