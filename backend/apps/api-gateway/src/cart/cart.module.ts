import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CartController } from './cart.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: 'PRODUCTS_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: Number(process.env.PRODUCTS_MS_PORT) || 3002,
          },
        }),
      },
      {
        name: 'INVOICES_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: Number(process.env.INVOICES_MS_PORT) || 3003,
          },
        }),
      },
    ]),
  ],
  controllers: [CartController],
})
export class CartModule {}