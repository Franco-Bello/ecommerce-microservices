export interface CartItem {
  reservationId: number;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
  subtotal: number;
  hasStockWarning: boolean;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
}

export interface AddToCartPayload {
  productId: number;
  quantity: number;
}