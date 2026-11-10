export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}