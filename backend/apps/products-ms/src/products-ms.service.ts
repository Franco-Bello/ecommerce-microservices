import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsMsService {
  getHello(): string {
    return 'Hello World!';
  }
}
