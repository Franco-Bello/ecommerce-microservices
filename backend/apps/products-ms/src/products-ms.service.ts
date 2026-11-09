import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { DataSource, LessThan, Repository } from 'typeorm';
import * as cron from 'node-cron';
import { Product } from './entities/product.entity';
import { Reservation } from './entities/reservation.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class ProductsMsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsMsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    private readonly dataSource: DataSource,
  ) {}

  // Punto Extra PDF: Cron job con node-cron para limpiar reservas de más de 3 días
  onModuleInit() {
    // Se ejecuta todos los días a la medianoche ('0 0 * * *')
    cron.schedule('0 0 * * *', async () => {
      await this.cleanExpiredReservations();
    });
    this.logger.log('Cron job (node-cron) inicializado: limpieza de reservas > 3 días activa');
  }

  async cleanExpiredReservations() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const result = await this.reservationRepo.delete({
      createdAt: LessThan(threeDaysAgo),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`Limpieza automática: se liberaron ${result.affected} reservas vencidas (> 3 días)`);
    }
    return { deletedReservations: result.affected || 0 };
  }

  // Auxiliar: Calcula cuántas unidades están reservadas actualmente para un producto
  private async getReservedCount(productId: number): Promise<number> {
    const reservations = await this.reservationRepo.find({ where: { productId } });
    return reservations.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ================= CRUD DE PRODUCTOS =================

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepo.create(createProductDto);
    const saved = await this.productRepo.save(product);
    return {
      ...saved,
      price: Number(saved.price),
      reservedStock: 0,
      availableStock: saved.stock,
    };
  }

  async findAll() {
    const products = await this.productRepo.find({
      where: { isActive: true },
      relations: { reservations: true },
      order: { id: 'ASC' },
    });

    return products.map((p) => {
      const reservedStock = (p.reservations || []).reduce((sum, r) => sum + r.quantity, 0);
      const { reservations, ...productData } = p;
      return {
        ...productData,
        price: Number(p.price),
        reservedStock,
        availableStock: Math.max(0, p.stock - reservedStock),
      };
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id, isActive: true },
      relations: { reservations: true },
    });

    if (!product) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Producto con ID #${id} no encontrado`,
      });
    }

    const reservedStock = (product.reservations || []).reduce((sum, r) => sum + r.quantity, 0);
    const { reservations, ...productData } = product;

    return {
      ...productData,
      price: Number(product.price),
      reservedStock,
      availableStock: Math.max(0, product.stock - reservedStock),
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id, isActive: true } });
    if (!product) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Producto con ID #${id} no encontrado`,
      });
    }

    Object.assign(product, updateProductDto);
    await this.productRepo.save(product);
    return this.findOne(id);
  }

  async remove(id: number) {
    const product = await this.productRepo.findOne({ where: { id, isActive: true } });
    if (!product) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Producto con ID #${id} no encontrado`,
      });
    }

    product.isActive = false;
    await this.productRepo.save(product);
    // Liberar reservas activas de este producto dado de baja
    await this.reservationRepo.delete({ productId: id });

    return { message: `Producto #${id} eliminado correctamente` };
  }

  // ================= CARRITO Y RESERVAS =================

  async addToCart(dto: AddToCartDto) {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, isActive: true },
    });

    if (!product) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'El producto no existe o no está disponible',
      });
    }

    const totalReserved = await this.getReservedCount(dto.productId);
    const availableStock = product.stock - totalReserved;

    if (availableStock < dto.quantity) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Stock disponible insuficiente para "${product.name}". Disponible para reservar: ${Math.max(0, availableStock)}`,
      });
    }

    // Verificar si el usuario ya tenía este producto en su carrito
    let reservation = await this.reservationRepo.findOne({
      where: { userId: dto.userId, productId: dto.productId },
    });

    if (reservation) {
      reservation.quantity += dto.quantity;
    } else {
      reservation = this.reservationRepo.create({
        userId: dto.userId,
        productId: dto.productId,
        quantity: dto.quantity,
      });
    }

    await this.reservationRepo.save(reservation);
    return this.getUserCart(dto.userId);
  }

  async getUserCart(userId: number) {
    const reservations = await this.reservationRepo.find({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'ASC' },
    });

    const items = reservations.map((r) => {
      const unitPrice = Number(r.product.price);
      const hasStockWarning = r.product.stock < r.quantity || !r.product.isActive;
      return {
        reservationId: r.id,
        productId: r.productId,
        name: r.product.name,
        unitPrice,
        quantity: r.quantity,
        subtotal: Number((unitPrice * r.quantity).toFixed(2)),
        physicalStock: r.product.stock,
        hasStockWarning,
        reservedAt: r.createdAt,
      };
    });

    const total = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

    return {
      userId,
      items,
      total,
    };
  }

  async removeFromCart(userId: number, productId: number) {
    const reservation = await this.reservationRepo.findOne({
      where: { userId, productId },
    });

    if (!reservation) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'El producto no se encuentra en tu carrito',
      });
    }

    await this.reservationRepo.remove(reservation);
    return this.getUserCart(userId);
  }

  async clearCart(userId: number) {
    await this.reservationRepo.delete({ userId });
    return { message: 'Carrito vaciado exitosamente', items: [], total: 0 };
  }

  // Confirmar compra: Descuenta el stock físico real en MySQL y limpia el carrito del usuario
  async confirmPurchase(userId: number) {
    return this.dataSource.transaction(async (manager) => {
      const reservations = await manager.find(Reservation, {
        where: { userId },
        relations: { product: true },
      });

      if (reservations.length === 0) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'El carrito está vacío, no se puede confirmar la compra',
        });
      }

      const purchasedItems: Array<{
        productId: number;
        name: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }> = [];

      for (const res of reservations) {
        const product = await manager.findOne(Product, {
          where: { id: res.productId, isActive: true },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product || product.stock < res.quantity) {
          throw new RpcException({
            statusCode: HttpStatus.CONFLICT,
            message: `El producto "${res.product?.name || res.productId}" ya no tiene stock suficiente (Stock actual: ${product?.stock ?? 0})`,
          });
        }

        // Descontar el stock físico definitivamente
        product.stock -= res.quantity;
        await manager.save(Product, product);

        const unitPrice = Number(product.price);
        purchasedItems.push({
          productId: product.id,
          name: product.name,
          unitPrice,
          quantity: res.quantity,
          subtotal: Number((unitPrice * res.quantity).toFixed(2)),
        });
      }

      // Eliminar las reservas del carrito tras descontar el stock
      await manager.delete(Reservation, { userId });

      const total = Number(
        purchasedItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
      );

      return {
        userId,
        items: purchasedItems,
        total,
        confirmedAt: new Date(),
      };
    });
  }
}