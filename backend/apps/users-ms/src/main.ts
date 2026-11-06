import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { UsersMsModule } from './users-ms.module';

async function bootstrap() {
  const logger = new Logger('UsersMS-Bootstrap');
  const port = Number(process.env.USERS_MS_PORT) || 3001;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersMsModule,
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
  logger.log(`Users Microservice escuchando por TCP en 127.0.0.1:${port}`);
}
bootstrap();