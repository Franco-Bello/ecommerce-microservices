import { Test, TestingModule } from '@nestjs/testing';
import { ProductsMsController } from './products-ms.controller';
import { ProductsMsService } from './products-ms.service';

describe('ProductsMsController', () => {
  let productsMsController: ProductsMsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductsMsController],
      providers: [ProductsMsService],
    }).compile();

    productsMsController = app.get<ProductsMsController>(ProductsMsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(productsMsController.getHello()).toBe('Hello World!');
    });
  });
});
