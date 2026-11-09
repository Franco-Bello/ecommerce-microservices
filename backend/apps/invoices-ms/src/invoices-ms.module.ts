import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesMsController } from './invoices-ms.controller';
import { InvoicesMsService } from './invoices-ms.service';
import { Invoice } from './entities/invoice.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGO_URI || 'mongodb://localhost:27017/Facturas_collection',
      entities: [Invoice],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Invoice]),
  ],
  controllers: [InvoicesMsController],
  providers: [InvoicesMsService],
})
export class InvoicesMsModule {}