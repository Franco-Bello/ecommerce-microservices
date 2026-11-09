import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InvoicesController } from './invoices.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
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
      {
        name: 'USERS_SERVICE',
        useFactory: () => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: Number(process.env.USERS_MS_PORT) || 3001,
          },
        }),
      },
    ]),
  ],
  controllers: [InvoicesController],
})
export class InvoicesModule {}