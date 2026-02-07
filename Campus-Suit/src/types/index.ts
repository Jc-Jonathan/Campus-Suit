export interface Order {
  orderId: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  paymentDocumentUrl: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface OrderItem {
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  newPrice: string;
  oldPrice: string;
}
