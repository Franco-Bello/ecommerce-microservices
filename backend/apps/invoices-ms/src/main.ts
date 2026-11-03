import { NestFactory } from '@nestjs/core';
import { InvoicesMsModule } from './invoices-ms.module';

async function bootstrap() {
  const app = await NestFactory.create(InvoicesMsModule);
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
