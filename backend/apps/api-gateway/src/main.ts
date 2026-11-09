import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ApiGatewayModule } from './api-gateway.module';
import { RpcCustomExceptionFilter } from './common/filters/rpc-custom-exception.filter';

async function bootstrap() {
  const logger = new Logger('ApiGateway-Bootstrap');
  const app = await NestFactory.create(ApiGatewayModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new RpcCustomExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Commerce Microservices API Gateway')
    .setDescription('API Gateway para gestión de Usuarios, Productos, Carrito y Facturas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Montamos Scalar en /api/docs reemplazando SwaggerModule.setup
  app.use(
    '/api/docs',
    apiReference({
      theme: 'deepSpace', // Opciones: 'default', 'alternate', 'moon', 'purple', 'solarized', 'bluePlanet', 'deepSpace', 'saturn', 'kepler', 'mars'
      content: document,
    }),
  );

  const port = Number(process.env.GATEWAY_PORT) || 3000;
  await app.listen(port);
  logger.log(`API Gateway corriendo en http://localhost:${port}/api`);
  logger.log(`Swagger Docs disponible en http://localhost:${port}/api/docs`);
}
bootstrap();