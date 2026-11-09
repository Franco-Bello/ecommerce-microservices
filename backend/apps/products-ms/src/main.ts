import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ProductsMsModule } from './products-ms.module';

async function bootstrap() {
  const logger = new Logger('ProductsMS-Bootstrap');
  const port = Number(process.env.PRODUCTS_MS_PORT) || 3002;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductsMsModule,
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
  logger.log(`Products Microservice escuchando por TCP en 127.0.0.1:${port}`);
}
bootstrap();