import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesMsController } from './invoices-ms.controller';
import { InvoicesMsService } from './invoices-ms.service';

describe('InvoicesMsController', () => {
  let invoicesMsController: InvoicesMsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesMsController],
      providers: [InvoicesMsService],
    }).compile();

    invoicesMsController = app.get<InvoicesMsController>(InvoicesMsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(invoicesMsController.getHello()).toBe('Hello World!');
    });
  });
});
