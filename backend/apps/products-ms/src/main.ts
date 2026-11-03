import { NestFactory } from '@nestjs/core';
import { ProductsMsModule } from './products-ms.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsMsModule);
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
