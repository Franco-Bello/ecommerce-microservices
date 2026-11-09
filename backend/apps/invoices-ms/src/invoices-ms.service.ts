import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesMsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: MongoRepository<Invoice>,
  ) {}

  private formatInvoice(invoice: Invoice) {
    return {
      id: invoice._id.toString(),
      userId: invoice.userId,
      items: invoice.items,
      total: Number(invoice.total),
      createdAt: invoice.createdAt,
    };
  }

  // 1. Crear factura (Llamado al confirmar compra en el carrito)
  async create(createInvoiceDto: CreateInvoiceDto) {
    const invoice = this.invoiceRepo.create({
      userId: createInvoiceDto.userId,
      items: createInvoiceDto.items,
      total: Number(createInvoiceDto.total.toFixed(2)),
      createdAt: new Date(),
    });

    const saved = await this.invoiceRepo.save(invoice);
    return this.formatInvoice(saved);
  }

  // 2. Listar todas las facturas (Para vista ADMIN)
  async findAll() {
    const invoices = await this.invoiceRepo.find({
      order: { createdAt: 'DESC' },
    });
    return invoices.map((inv) => this.formatInvoice(inv));
  }

  // 3. Listar facturas de un usuario específico (Para vista USER)
  async findByUser(userId: number) {
    const invoices = await this.invoiceRepo.find({
      where: { userId: Number(userId) },
      order: { createdAt: 'DESC' },
    });
    return invoices.map((inv) => this.formatInvoice(inv));
  }

  // 4. Obtener una factura por su ID de MongoDB
  async findOne(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'El formato del ID de factura no es un ObjectId válido',
      });
    }

    const invoice = await this.invoiceRepo.findOneBy({
      _id: new ObjectId(id),
    });

    if (!invoice) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Factura #${id} no encontrada`,
      });
    }

    return this.formatInvoice(invoice);
  }
}