import { User } from './user.model';

export interface InvoiceItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Invoice {
  id?: string;
  _id?: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  items: InvoiceItem[];
  total: number;
  createdAt: string;
}