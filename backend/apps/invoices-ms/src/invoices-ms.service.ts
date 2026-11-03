import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicesMsService {
  getHello(): string {
    return 'Hello World!';
  }
}
