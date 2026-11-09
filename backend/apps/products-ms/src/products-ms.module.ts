import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsMsController } from './products-ms.controller';
import { ProductsMsService } from './products-ms.service';
import { Product } from './entities/product.entity';
import { Reservation } from './entities/reservation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'rootpassword',
      database: process.env.MYSQL_DB || 'Productos_table',
      entities: [Product, Reservation],
      synchronize: true, // Crea automáticamente las tablas products y reservations en desarrollo
    }),
    TypeOrmModule.forFeature([Product, Reservation]),
  ],
  controllers: [ProductsMsController],
  providers: [ProductsMsService],
})
export class ProductsMsModule {}