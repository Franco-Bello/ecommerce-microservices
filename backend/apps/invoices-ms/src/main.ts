import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { InvoicesMsModule } from './invoices-ms.module';

async function bootstrap() {
  const logger = new Logger('InvoicesMS-Bootstrap');
  const port = Number(process.env.INVOICES_MS_PORT) || 3003;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InvoicesMsModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();
  logger.log(`Invoices Microservice escuchando por TCP en 127.0.0.1:${port}`);
}
bootstrap();