import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
} from 'typeorm';

import { ObjectId } from 'mongodb';

export class InvoiceItem {
  @Column()
  productId: number;

  @Column()
  name: string;

  @Column()
  unitPrice: number;

  @Column()
  quantity: number;

  @Column()
  subtotal: number;
}

@Entity('Facturas_collection')
export class Invoice {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: number;

  @Column()
  items: InvoiceItem[];

  @Column()
  total: number;

  @CreateDateColumn()
  createdAt: Date;
}